-- Admin ESA — AI Seam (Jobs + Audit) with tenant isolation
-- Safe to run multiple times.

begin;

create extension if not exists pgcrypto;

-- AI job queue
create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  scope text not null default 'tenant' check (scope in ('tenant','platform')),
  kind text not null, -- e.g. 'admin_assistant', 'customer_support', 'code_review'
  input jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','claimed','succeeded','failed','canceled')),
  claimed_by text, -- worker id
  claimed_at timestamptz,
  result jsonb,
  error text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_jobs_tenant_created_idx on public.ai_jobs (tenant_id, created_at desc);
create unique index if not exists ai_jobs_idempotency_idx on public.ai_jobs (tenant_id, idempotency_key)
  where idempotency_key is not null;

-- AI audit events (separate from general audit_events, optional)
create table if not exists public.ai_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_audit_events_tenant_created_idx on public.ai_audit_events (tenant_id, created_at desc);

-- updated_at trigger helper assumed in phase3_5_core.sql (set_updated_at)
DO $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    -- attach triggers if missing
    if not exists (select 1 from pg_trigger where tgname = 'ai_jobs_set_updated_at') then
      create trigger ai_jobs_set_updated_at
      before update on public.ai_jobs
      for each row execute function public.set_updated_at();
    end if;

    if not exists (select 1 from pg_trigger where tgname = 'ai_audit_events_set_updated_at') then
      -- ai_audit_events doesn't have updated_at; skip
    end if;
  end if;
end $$;

-- RLS
alter table public.ai_jobs enable row level security;
alter table public.ai_audit_events enable row level security;

-- Helper: current user must be a member of tenant (any role)
create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = p_tenant_id and tm.user_id = auth.uid()
  );
$$;

-- Policies: tenant jobs are visible only within tenant membership.
DO $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_jobs' and policyname='ai_jobs_select_member') then
    create policy ai_jobs_select_member
    on public.ai_jobs
    for select
    using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_jobs' and policyname='ai_jobs_insert_member') then
    create policy ai_jobs_insert_member
    on public.ai_jobs
    for insert
    with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_jobs' and policyname='ai_jobs_update_self') then
    create policy ai_jobs_update_self
    on public.ai_jobs
    for update
    using (public.is_tenant_member(tenant_id))
    with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_audit_events' and policyname='ai_audit_select_member') then
    create policy ai_audit_select_member
    on public.ai_audit_events
    for select
    using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ai_audit_events' and policyname='ai_audit_insert_member') then
    create policy ai_audit_insert_member
    on public.ai_audit_events
    for insert
    with check (public.is_tenant_member(tenant_id));
  end if;
end $$;

commit;
