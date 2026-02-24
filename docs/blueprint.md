# Admin ESA — Control Plane Blueprint (Carai Agency)

**Carai Agency** — *“Where Caribbean spirit meets intelligent design.”*

Admin ESA is the **multi-tenant control plane** (Shopify-style admin) for future tenant storefronts/apps.

## Non‑Negotiables

- **Next.js App Router** (current repo), **Node 20+**
- **TypeScript**, **Tailwind**, **shadcn/ui**
- **Supabase is the ONLY Source of Truth + Auth** (magic link OTP)
- **No Firebase Auth / Firestore**
- **Belt + Suspenders:** server-side guards + DB RLS + auditability
- **Multi-tenant isolation:** tenant resolution + membership checks + RLS

## What this repo is (and is NOT)

✅ **Is:**
- Platform dashboard (tenants, roles, plans, modules)
- Tenant-scoped admin views under `/{tenantSlug}/...`
- Secure API routes (Stripe webhooks, AI job seam, etc.)

❌ **Is NOT:**
- A tenant storefront/public marketing site
- Tenant-branded frontends (those are separate apps + deployments)

## UX Theme

- Day: **white + ocean blue + gold**
- Night: **charcoal + ocean blue + gold**
- Aesthetic: *clean “admin luxury”*

## Core Modules (initial)

- Tenants & membership (RBAC)
- Audit log
- Credits / usage
- Billing sync (Stripe → Supabase)
- AI seam (optional later): queued jobs, audit events, credit deduction

## Guardrails & Verification

Every change should pass:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Deployment Notes

- Firebase Studio / Cloud Workstations preview URLs vary: origin must be derived from forwarded headers.
- Service role key is **backend-only**.
