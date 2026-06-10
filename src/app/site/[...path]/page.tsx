import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { resolveTenantFromHost } from '@/lib/resolve-tenant-from-host'
import { SiteRenderer } from '@/components/site-renderer'

export default async function SiteCatchAllPage({
  params,
}: {
  params: Promise<{ path?: string[] }>
}) {
  const { path = [] } = await params
  const host = (await headers()).get('host') || ''
  const tenant = await resolveTenantFromHost(host)

  if (!tenant) {
    notFound()
  }

  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const pages = [] as any[]
  const sections = [] as any[]

  if (hasSupabaseEnv) {
    const supabase = await createServerSupabase()

    const [pagesResult, sectionsResult] = await Promise.all([
      supabase
        .from('website_pages')
        .select('id, slug, title, published')
        .eq('tenant_id', tenant.id)
        .eq('published', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('website_sections')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true }),
    ])

    pages.push(...(pagesResult.data ?? []))
    sections.push(...(sectionsResult.data ?? []))
  }
  const currentPath = path.join('/') || 'home'

  const page = pages.find((entry: any) => entry.slug === currentPath || entry.slug === 'home')

  return (
    <SiteRenderer
      tenant={tenant}
      page={page ?? null}
      pages={pages as any[]}
      sections={sections as any[]}
      path={currentPath}
    />
  )
}
