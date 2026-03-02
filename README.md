# Admin ESA

This project is for Carai Agency - Caribbean AI Agency.

## Core Modules

- Tenants & membership (RBAC)
- Audit log
- Credits / usage
- Billing sync (Stripe → Supabase)
- AI seam (optional later): queued jobs, audit events, credit deduction

## Known Issues

- **Audit Log Interface:** The tenant audit logging interface at `src/app/[tenantSlug]/audit-logs/page.tsx` is currently a placeholder and needs to be implemented.

## Guardrails & Verification

Every change should pass:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Deployment Notes

- Firebase Studio / Cloud Workstations preview URLs vary: origin must be derived from forwarded headers.
- Service role key is **backend-only**.
