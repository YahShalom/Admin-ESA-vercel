import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createServerSupabase } from '@/lib/supabase/server'
import { resolveTenantBySlug } from '@/lib/tenant/resolve'
import { getOrCreateSite, togglePagePublished } from '@/app/actions/website'

export default async function WebsitePagesPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const tenant = await resolveTenantBySlug(tenantSlug)
  const supabase = await createServerSupabase()
  const { site } = await getOrCreateSite(tenantSlug)

  const { data: pages } = await supabase
    .from('website_pages')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Website / Pages</p>
          <h1 className="text-2xl font-semibold tracking-tight">Pages manager</h1>
          <p className="text-muted-foreground">Create and publish landing pages for {tenant.name}.</p>
        </div>
        <Button asChild>
          <Link href={`/${tenantSlug}/website`}>Back to overview</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current pages</CardTitle>
          <CardDescription>Site: {site?.name || tenant.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(pages ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No pages are configured yet.</p>
          ) : (
            (pages ?? []).map((page: any) => (
              <article key={page.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">{page.title || page.slug}</h2>
                    <Badge variant={page.published ? 'default' : 'secondary'}>
                      {page.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">/{page.slug}</p>
                </div>
                <form action={async () => {
                  'use server'
                  await togglePagePublished(page.id, !page.published)
                }}>
                  <Button type="submit" variant="outline">{page.published ? 'Unpublish' : 'Publish'}</Button>
                </form>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
