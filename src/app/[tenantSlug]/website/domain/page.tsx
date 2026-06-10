import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getOrCreateSite, saveDomain } from '@/app/actions/website'

export default async function WebsiteDomainPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { site } = await getOrCreateSite(tenantSlug)

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Website / Domain</p>
        <h1 className="text-2xl font-semibold tracking-tight">Domain settings</h1>
        <p className="text-muted-foreground">Connect a custom hostname for your tenant storefront.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom domain</CardTitle>
          <CardDescription>Store the host that should serve this site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              'use server'
              await saveDomain(tenantSlug, String(formData.get('customDomain') || ''))
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom domain</Label>
              <Input
                id="customDomain"
                name="customDomain"
                defaultValue={String(site?.custom_domain || '')}
                placeholder="www.example.com"
              />
            </div>
            <Button type="submit">Save domain</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current setup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Primary site slug: {site?.slug || tenantSlug}</p>
          <p className="text-sm text-muted-foreground">Configured domain: {site?.custom_domain || 'Not set yet'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
