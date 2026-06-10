import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { createServerSupabase } from '@/lib/supabase/server'
import { resolveTenantBySlug } from '@/lib/tenant/resolve'
import { getOrCreateSite, deleteSection, toggleSectionVisible } from '@/app/actions/website'
import SectionForm from './SectionForm'

export default async function WebsiteSectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { tenantSlug } = await params
  const { page } = await searchParams
  const tenant = await resolveTenantBySlug(tenantSlug)
  const { site } = await getOrCreateSite(tenantSlug)
  const supabase = await createServerSupabase()

  const { data: pages } = await supabase
    .from('website_pages')
    .select('id, slug, title')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  const selectedPageId = pages?.find((entry: any) => entry.id === page)?.id ?? pages?.[0]?.id ?? ''

  const { data: sections } = await supabase
    .from('website_sections')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('page_id', selectedPageId)
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Website / Sections</p>
          <h1 className="text-2xl font-semibold tracking-tight">Sections manager</h1>
          <p className="text-muted-foreground">Arrange content blocks for each page in {tenant.name}.</p>
        </div>
        <Button asChild>
          <Link href={`/${tenantSlug}/website`}>Back to overview</Link>
        </Button>
      </div>

      {!(pages ?? []).length ? (
        <Card>
          <CardHeader>
            <CardTitle>No pages yet</CardTitle>
            <CardDescription>Create a page first, then return here to add sections.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/${tenantSlug}/website/pages`}>Create your first page</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Choose a page</CardTitle>
              <CardDescription>Site: {site?.name || tenant.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form method="get" className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="page">Page</Label>
                  <select
                    id="page"
                    name="page"
                    defaultValue={selectedPageId}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {(pages ?? []).map((pageEntry: any) => (
                      <option key={pageEntry.id} value={pageEntry.id}>
                        {pageEntry.title || pageEntry.slug}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit">Load page</Button>
              </form>
            </CardContent>
          </Card>

          <SectionForm tenantSlug={tenantSlug} selectedPageId={selectedPageId} />

          <Card>
            <CardHeader>
              <CardTitle>Current sections</CardTitle>
              <CardDescription>Sections for the selected page are ordered by sort order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!(sections ?? []).length ? (
                <p className="text-sm text-muted-foreground">No sections are configured for this page yet.</p>
              ) : (
                (sections ?? []).map((section: any) => (
                  <article key={section.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold capitalize">{section.type}</h2>
                          <Badge variant={section.is_visible ? 'default' : 'secondary'}>
                            {section.is_visible ? 'Visible' : 'Hidden'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Sort order: {section.sort_order ?? 0}</p>
                        <p className="text-sm text-muted-foreground">Content: {JSON.stringify(section.content ?? {})}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <form action={async () => {
                          'use server'
                          await toggleSectionVisible(section.id, Boolean(section.is_visible), tenantSlug)
                        }}>
                          <Button type="submit" variant="outline" size="sm">
                            {section.is_visible ? 'Hide' : 'Show'}
                          </Button>
                        </form>
                        <form action={async () => {
                          'use server'
                          await deleteSection(section.id, tenantSlug)
                        }}>
                          <Button type="submit" variant="destructive" size="sm">Delete</Button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
