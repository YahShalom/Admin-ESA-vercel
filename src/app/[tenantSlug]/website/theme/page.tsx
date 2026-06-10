import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createServerSupabase } from '@/lib/supabase/server'
import { resolveTenantBySlug } from '@/lib/tenant/resolve'
import { getOrCreateSite, saveSiteTheme, upsertSection } from '@/app/actions/website'

export default async function WebsiteThemePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const tenant = await resolveTenantBySlug(tenantSlug)
  const { site } = await getOrCreateSite(tenantSlug)
  const supabase = await createServerSupabase()

  const { data: sections } = await supabase
    .from('website_sections')
    .select('*')
    .eq('tenant_id', tenant.id)

  const theme = (site?.theme as Record<string, unknown>) ?? {}

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Website / Theme</p>
        <h1 className="text-2xl font-semibold tracking-tight">Theme editor</h1>
        <p className="text-muted-foreground">Tune the site palette and accent values for {tenant.name}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme settings</CardTitle>
          <CardDescription>These values are saved as part of the website theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              'use server'
              await saveSiteTheme(tenantSlug, {
                palette: String(formData.get('palette') || theme.palette || 'ocean'),
                accent: String(formData.get('accent') || theme.accent || 'gold'),
                heroTitle: String(formData.get('heroTitle') || theme.heroTitle || tenant.name),
              })
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="palette">Palette</Label>
              <Input id="palette" name="palette" defaultValue={String(theme.palette || 'ocean')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent">Accent</Label>
              <Input id="accent" name="accent" defaultValue={String(theme.accent || 'gold')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="heroTitle">Hero title</Label>
              <Input id="heroTitle" name="heroTitle" defaultValue={String(theme.heroTitle || tenant.name)} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save theme</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>Seed modules that can be rendered on the storefront.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(sections ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No website sections have been added yet.</p>
          ) : (
            (sections ?? []).map((section: any) => (
              <div key={section.id} className="rounded-lg border p-4 text-sm">
                <div className="font-medium">{section.type}</div>
                <div className="text-muted-foreground">{JSON.stringify(section.content ?? {})}</div>
              </div>
            ))
          )}
          <form
            action={async () => {
              'use server'
              await upsertSection(tenantSlug, {
                page_id: (sections?.[0]?.page_id as string) ?? '',
                type: 'hero',
                content: { title: tenant.name },
              })
            }}
          >
            <Button type="submit" variant="outline">Add hero section</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
