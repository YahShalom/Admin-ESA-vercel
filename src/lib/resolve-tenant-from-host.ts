import { createServerSupabase } from '@/lib/supabase/server'

export type ResolvedTenant = {
  id: string
  name: string
  slug: string
} | null

function normalizeHost(host: string) {
  return host.split(':')[0].trim().toLowerCase()
}

export async function resolveTenantFromHost(host?: string | null): Promise<ResolvedTenant> {
  const cleanHost = normalizeHost(host || '')
  if (!cleanHost) return null

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'carai.agency'
  const isAdminDomain = cleanHost === 'admin.' + rootDomain || cleanHost === rootDomain
  const isSubdomain = cleanHost.endsWith(`.${rootDomain}`) && !isAdminDomain
  const isCustomDomain = !cleanHost.endsWith(rootDomain) && !cleanHost.includes('localhost') && !cleanHost.includes('vercel.app')

  if (!isSubdomain && !isCustomDomain) return null

  const tenantSlug = isSubdomain ? cleanHost.replace(`.${rootDomain}`, '') : cleanHost

  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .or(`slug.eq.${tenantSlug},custom_domain.eq.${cleanHost}`)
    .maybeSingle()

  if (error || !data) return null
  return data as ResolvedTenant
}
