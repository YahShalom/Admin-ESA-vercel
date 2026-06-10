import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createServerSupabase } from '@/lib/supabase/server'
import { resolveTenantBySlug } from '@/lib/tenant/resolve'
import { getOrCreateSite, publishSite } from '@/app/actions/website'

export default async function WebsiteOverviewPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const tenant = await resolveTenantBySlug(tenantSlug)
  const supabase = await createServerSupabase()

  const { site } = await getOrCreateSite(tenantSlug)

  const { data: pageRows } = await supabase
    .from('website_pages')
    .select('*')
    .eq('tenant_id', tenant.id)

  const totalPages = pageRows?.length ?? 0
  const publishedPages = pageRows?.filter((page: any) => page.published).length ?? 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">{tenant.name} website</h1>
          <p className="text-muted-foreground">Manage your public site, pages, theme, and domain from one place.</p>
        </div>
        <Badge variant={site?.published ? 'default' : 'secondary'}>
          {site?.published ? 'Published' : 'Draft'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Site status</CardTitle>
            <CardDescription>Live publishing state for the tenant website.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{site?.published ? 'Live' : 'Draft'}</div>
            <form action={async () => {
              'use server'
              await publishSite(tenantSlug, !site?.published)
            }}>
              <Button type="submit" className="mt-4 w-full">{site?.published ? 'Unpublish site' : 'Publish site'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
            <CardDescription>Current pages in your website.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalPages}</div>
            <p className="text-sm text-muted-foreground">{publishedPages} currently published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain</CardTitle>
            <CardDescription>Use a custom hostname for your storefront.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{site?.custom_domain || 'No custom domain configured'}</div>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href={`/${tenantSlug}/website/domain`}>Configure domain</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${tenantSlug}/website/pages`}>Manage pages</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${tenantSlug}/website/theme`}>Edit theme</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${tenantSlug}/website/domain`}>Set domain</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current theme</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(site?.theme ?? {}, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
