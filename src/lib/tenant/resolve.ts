
'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type Tenant } from '@/types/tenant'
import { getProxyContext } from '@/lib/http/proxy'

export async function resolveTenantBySlug(slug: string): Promise<Tenant> {
  const supabase = await createServerSupabase()
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !tenant) {
    redirect('/auth/tenant-not-found')
  }

  return tenant
}

/**
 * MVP resolver used across the app.
 * Today: resolve by tenantSlug.
 * Next: if tenantSlug is missing (custom domain entry), resolve via host mapping.
 */
export async function resolveTenantBySlugOrHost(tenantSlug?: string | null): Promise<Tenant> {
  if (tenantSlug) return resolveTenantBySlug(tenantSlug)

  const { host } = await getProxyContext()
  if (!host) redirect('/auth/tenant-not-found')

  // Domain-based resolution is a Phase 4 concern; keep the hook here so
  // the rest of the app doesn't change when we add it.
  redirect('/auth/tenant-not-found')
}
