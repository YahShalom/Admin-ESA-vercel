'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'
import { resolveTenantBySlug } from '@/lib/tenant/resolve'

async function ensureTenantContext(tenantSlug: string) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const tenant = await resolveTenantBySlug(tenantSlug)

  return { supabase, tenant, user }
}

export async function getOrCreateSite(tenantSlug: string) {
  const { supabase, tenant } = await ensureTenantContext(tenantSlug)
  const sb: any = supabase

  const { data: existingSite, error: fetchError } = await sb
    .from('website_sites')
    .select('*')
    .eq('tenant_id', tenant.id)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (existingSite) return { site: existingSite, tenant }

  const { data: createdSite, error: createError } = await sb
    .from('website_sites')
    .insert({
      tenant_id: tenant.id,
      slug: tenant.slug,
      name: `${tenant.name} Website`,
      published: false,
      theme: { palette: 'ocean', accent: 'gold' },
    })
    .select('*')
    .single()

  if (createError) throw createError

  revalidatePath(`/${tenantSlug}/website`)

  return { site: createdSite, tenant }
}

export async function publishSite(tenantSlug: string, published: boolean) {
  const { supabase, tenant } = await ensureTenantContext(tenantSlug)
  const sb: any = supabase

  const { data: site, error } = await sb
    .from('website_sites')
    .update({ published })
    .eq('tenant_id', tenant.id)
    .select('*')
    .single()

  if (error) throw error

  revalidatePath(`/${tenantSlug}/website`)
  return { site }
}

export async function saveSiteTheme(tenantSlug: string, theme: Record<string, unknown>) {
  const { supabase, tenant } = await ensureTenantContext(tenantSlug)
  const sb: any = supabase

  const { data: site, error } = await sb
    .from('website_sites')
    .update({ theme })
    .eq('tenant_id', tenant.id)
    .select('*')
    .single()

  if (error) throw error

  revalidatePath(`/${tenantSlug}/website/theme`)
  return { site }
}

export async function upsertPage(tenantSlug: string, page: {
  id?: string
  slug: string
  title: string
  published?: boolean
}) {
  const { supabase, tenant } = await ensureTenantContext(tenantSlug)
  const sb: any = supabase

  const payload = {
    id: page.id,
    tenant_id: tenant.id,
    slug: page.slug,
    title: page.title,
    published: page.published ?? true,
  }

  const { data: existingPage, error: fetchError } = await sb
    .from('website_pages')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('slug', page.slug)
    .maybeSingle()

  if (fetchError) throw fetchError

  const { data, error } = await sb
    .from('website_pages')
    .upsert({ ...payload, id: existingPage?.id ?? page.id }, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) throw error

  revalidatePath(`/${tenantSlug}/website/pages`)
  return { page: data }
}

export async function togglePagePublished(pageId: string, published: boolean) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const sb: any = supabase
  const { data: page, error } = await sb
    .from('website_pages')
    .update({ published })
    .eq('id', pageId)
    .select('id, tenant_id, slug, published')
    .single()

  if (error) throw error

  const tenantId = (page as any)?.tenant_id as string | undefined
  if (!tenantId) throw new Error('Missing tenant context for page')

  const { data: tenant } = await sb
    .from('tenants')
    .select('slug')
    .eq('id', tenantId)
    .maybeSingle()

  revalidatePath(`/${(tenant as any)?.slug ?? 'website'}/website/pages`)
  return { page }
}

export async function upsertSection(tenantSlug: string, section: {
  id?: string
  page_id: string
  type: string
  content?: Record<string, unknown>
  sort_order?: number
  is_visible?: boolean
}) {
  const { supabase, tenant } = await ensureTenantContext(tenantSlug)
  const sb: any = supabase

  const { data, error } = await sb
    .from('website_sections')
    .upsert(
      {
        id: section.id,
        tenant_id: tenant.id,
        page_id: section.page_id,
        type: section.type,
        content: section.content ?? {},
        sort_order: section.sort_order ?? 0,
        is_visible: section.is_visible ?? true,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  if (error) throw error

  revalidatePath(`/${tenantSlug}/website/theme`)
  revalidatePath(`/${tenantSlug}/website/sections`)
  return { section: data }
}

export async function deleteSection(sectionId: string, tenantSlug: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('website_sections')
    .delete()
    .eq('id', sectionId)

  revalidatePath(`/${tenantSlug}/website/sections`)
  return { error }
}

export async function toggleSectionVisible(sectionId: string, current: boolean, tenantSlug: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('website_sections')
    .update({ is_visible: !current })
    .eq('id', sectionId)

  revalidatePath(`/${tenantSlug}/website/sections`)
  return { error }
}

export async function saveDomain(tenantSlug: string, customDomain: string) {
  const { supabase, tenant } = await ensureTenantContext(tenantSlug)
  const sb: any = supabase

  const { data: site, error } = await sb
    .from('website_sites')
    .update({ custom_domain: customDomain.trim() || null })
    .eq('tenant_id', tenant.id)
    .select('*')
    .single()

  if (error) throw error

  revalidatePath(`/${tenantSlug}/website/domain`)
  return { site }
}
