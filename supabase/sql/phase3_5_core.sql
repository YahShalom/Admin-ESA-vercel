-- Admin ESA (Firebase-side repo) — Phase 3/4/5 Core: Multi-tenant RBAC + Audit + Credits + Stripe sync
-- NOTE: Run in Supabase SQL editor. Requires pgcrypto (gen_random_uuid).

begin;

-- Extensions
create extension if not exists pgcrypto;

-- ===== ENUMS =====
DO $$
begin
  if not exists (select 1 from pg_type where typname = 'tenant_role') then
    create type public.tenant_role as enum ('tech','owner','admin','editor','staff','viewer');
  end if;
end $$;

-- ===== TENANTS =====
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  plan text not null default 'starter',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tenants_slug_idx on public.tenants (slug);

-- ===== MEMBERSHIPS =====
create table if not exists public.tenant_memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.tenant_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create index if not exists tenant_memberships_user_idx on public.tenant_memberships (user_id);
create index if not exists tenant_memberships_tenant_idx on public.tenant_memberships (tenant_id);

-- ===== AUDIT EVENTS =====
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_tenant_created_idx on public.audit_events (tenant_id, created_at desc);

-- ===== CREDIT LEDGER =====
create table if not exists public.tenant_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  delta integer not null,
  reason text not null,
  ref text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tenant_credit_ledger_tenant_created_idx on public.tenant_credit_ledger (tenant_id, created_at desc);

-- Convenience view: current credits
create or replace view public.tenant_credit_balance as
select tenant_id, coalesce(sum(delta),0) as balance
from public.tenant_credit_ledger
group by tenant_id;

-- ===== STRIPE SYNC TABLES =====
create table if not exists public.stripe_customers (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  customer_id text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_subscriptions (
  subscription_id text primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_subscriptions_tenant_idx on public.stripe_subscriptions (tenant_id);

-- Idempotency for webhook events
create table if not exists public.stripe_events (
  event_id text primary key,
  received_at timestamptz not null default now()
);

-- ===== UPDATED_AT trigger helper =====
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

DO $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'tenants_set_updated_at') then
    create trigger tenants_set_updated_at before update on public.tenants
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'tenant_memberships_set_updated_at') then
    create trigger tenant_memberships_set_updated_at before update on public.tenant_memberships
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'stripe_customers_set_updated_at') then
    create trigger stripe_customers_set_updated_at before update on public.stripe_customers
    for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'stripe_subscriptions_set_updated_at') then
    create trigger stripe_subscriptions_set_updated_at before update on public.stripe_subscriptions
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- ===== AUTH HELPERS =====
create or replace function public.is_member(p_tenant_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.tenant_memberships m
    where m.tenant_id = p_tenant_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.tenant_role(p_tenant_id uuid)
returns public.tenant_role
language sql
stable
as $$
  select m.role
  from public.tenant_memberships m
  where m.tenant_id = p_tenant_id and m.user_id = auth.uid();
$$;

create or replace function public.has_role_at_least(p_tenant_id uuid, p_min public.tenant_role)
returns boolean
language plpgsql
stable
as $$
declare
  r public.tenant_role;
  rank int;
  min_rank int;
begin
  select public.tenant_role(p_tenant_id) into r;
  if r is null then return false; end if;

  -- rank order
  rank := case r
    when 'viewer' then 1
    when 'staff' then 2
    when 'editor' then 3
    when 'admin' then 4
    when 'owner' then 5
    when 'tech' then 6
    else 0 end;

  min_rank := case p_min
    when 'viewer' then 1
    when 'staff' then 2
    when 'editor' then 3
    when 'admin' then 4
    when 'owner' then 5
    when 'tech' then 6
    else 99 end;

  return rank >= min_rank;
end $$;

-- ===== CREDIT CHARGE RPC =====
create or replace function public.charge_credits(
  p_tenant_id uuid,
  p_amount integer,
  p_reason text,
  p_ref text default null,
  p_meta jsonb default '{}'::jsonb
)
returns table(balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  cur_balance int;
begin
  if p_amount <= 0 then
    raise exception 'amount_must_be_positive';
  end if;

  if not public.has_role_at_least(p_tenant_id, 'staff') then
    raise exception 'not_authorized';
  end if;

  select coalesce(sum(delta),0) into cur_balance
  from public.tenant_credit_ledger
  where tenant_id = p_tenant_id;

  if cur_balance < p_amount then
    raise exception 'insufficient_credits';
  end if;

  insert into public.tenant_credit_ledger(tenant_id, actor_user_id, delta, reason, ref, meta)
  values (p_tenant_id, auth.uid(), -p_amount, p_reason, p_ref, p_meta);

  insert into public.audit_events(tenant_id, actor_user_id, action, entity, entity_id, meta)
  values (p_tenant_id, auth.uid(), 'credits.charge', 'tenant', p_tenant_id::text,
          jsonb_build_object('amount', p_amount, 'reason', p_reason, 'ref', p_ref) || p_meta);

  return query
  select coalesce(sum(delta),0)::int
  from public.tenant_credit_ledger
  where tenant_id = p_tenant_id;
end $$;

-- ===== ONBOARD TENANT RPC =====
create or replace function public.onboard_tenant(
  p_user_id uuid,
  p_tenant_name text,
  p_plan text default 'starter'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_slug text;
  v_initial_credits int;
begin
  if p_user_id is null then
    raise exception 'user_required';
  end if;

  v_slug := lower(regexp_replace(p_tenant_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);

  -- ensure uniqueness
  if exists(select 1 from public.tenants where slug = v_slug) then
    v_slug := v_slug || '-' || substring(replace(gen_random_uuid()::text,'-',''),1,6);
  end if;

  insert into public.tenants(slug, name, plan)
  values (v_slug, p_tenant_name, p_plan)
  returning id into v_tenant_id;

  insert into public.tenant_memberships(tenant_id, user_id, role)
  values (v_tenant_id, p_user_id, 'owner');

  v_initial_credits := case p_plan
    when 'free' then 250
    when 'starter' then 2000
    when 'pro' then 10000
    when 'business' then 30000
    else 2000 end;

  insert into public.tenant_credit_ledger(tenant_id, actor_user_id, delta, reason, ref, meta)
  values (v_tenant_id, p_user_id, v_initial_credits, 'credits.grant', 'onboard', jsonb_build_object('plan', p_plan));

  insert into public.audit_events(tenant_id, actor_user_id, action, entity, entity_id, meta)
  values (v_tenant_id, p_user_id, 'tenant.create', 'tenant', v_tenant_id::text,
          jsonb_build_object('name', p_tenant_name, 'slug', v_slug, 'plan', p_plan));

  return v_tenant_id;
end $$;

-- ===== RLS =====
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.audit_events enable row level security;
alter table public.tenant_credit_ledger enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.stripe_subscriptions enable row level security;

-- tenants: members can read; admins+ can update
DO $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenants' and policyname='tenants_select_member') then
    create policy tenants_select_member on public.tenants
      for select
      using (exists(select 1 from public.tenant_memberships m where m.tenant_id = tenants.id and m.user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenants' and policyname='tenants_update_admin') then
    create policy tenants_update_admin on public.tenants
      for update
      using (public.has_role_at_least(id, 'admin'))
      with check (public.has_role_at_least(id, 'admin'));
  end if;
end $$;

-- memberships: members can read; owners/admins can manage
DO $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenant_memberships' and policyname='memberships_select_member') then
    create policy memberships_select_member on public.tenant_memberships
      for select
      using (public.is_member(tenant_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenant_memberships' and policyname='memberships_insert_owner') then
    create policy memberships_insert_owner on public.tenant_memberships
      for insert
      with check (public.has_role_at_least(tenant_id, 'owner'));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenant_memberships' and policyname='memberships_update_owner') then
    create policy memberships_update_owner on public.tenant_memberships
      for update
      using (public.has_role_at_least(tenant_id, 'owner'))
      with check (public.has_role_at_least(tenant_id, 'owner'));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenant_memberships' and policyname='memberships_delete_owner') then
    create policy memberships_delete_owner on public.tenant_memberships
      for delete
      using (public.has_role_at_least(tenant_id, 'owner'));
  end if;
end $$;

-- audit: members can read, only service/definer can insert via RPCs or server
DO $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='audit_events' and policyname='audit_select_member') then
    create policy audit_select_member on public.audit_events
      for select
      using (public.is_member(tenant_id));
  end if;
end $$;

-- credits: members can read
DO $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tenant_credit_ledger' and policyname='credits_select_member') then
    create policy credits_select_member on public.tenant_credit_ledger
      for select
      using (public.is_member(tenant_id));
  end if;
end $$;

-- stripe: members can read
DO $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='stripe_customers' and policyname='stripe_customers_select_member') then
    create policy stripe_customers_select_member on public.stripe_customers
      for select
      using (public.is_member(tenant_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='stripe_subscriptions' and policyname='stripe_subscriptions_select_member') then
    create policy stripe_subscriptions_select_member on public.stripe_subscriptions
      for select
      using (public.is_member(tenant_id));
  end if;
end $$;

commit;
