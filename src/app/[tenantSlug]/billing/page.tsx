import { createServerSupabase } from '@/lib/supabase/server'
import { resolveTenantBySlugOrHost } from '@/lib/tenant/resolve'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createBillingCheckoutSession, createBillingPortalSession } from '@/app/actions/billing'

export default async function BillingPage({ params }: { params: { tenantSlug: string } }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent>Please sign in.</CardContent>
        </Card>
      </div>
    )
  }

  const tenant = await resolveTenantBySlugOrHost(params.tenantSlug)

  const { data: balanceRow } = await supabase
    .from('tenant_credit_balance')
    .select('balance')
    .eq('tenant_id', tenant.id)
    .maybeSingle()

  const balance = (balanceRow as any)?.balance ?? 0

  const { data: sub } = await supabase
    .from('stripe_subscriptions')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Tenant: <span className="font-medium text-foreground">{tenant.name}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{balance}</div>
                <div className="text-sm text-muted-foreground">Current balance</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  Status:{' '}
                  <span className="font-medium">{(sub as any)?.status ?? 'none'}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {(sub as any)?.price_id ? `Price: ${(sub as any).price_id}` : 'No active subscription recorded yet.'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Replace PRICE_ID placeholders with real Stripe Price IDs */}
            <form action={async () => {
              'use server'
              const priceId = process.env.STRIPE_DEFAULT_PRICE_ID || ''
              if (!priceId) throw new Error('Missing STRIPE_DEFAULT_PRICE_ID')
              await createBillingCheckoutSession(params.tenantSlug, priceId)
            }}>
              <Button type="submit">Start / Change Plan</Button>
            </form>

            <form action={async () => {
              'use server'
              await createBillingPortalSession(params.tenantSlug)
            }}>
              <Button type="submit" variant="secondary">Manage in Stripe</Button>
            </form>
          </div>

          <div className="text-xs text-muted-foreground">
            Webhook endpoint: <span className="font-mono">/api/stripe/webhook</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
