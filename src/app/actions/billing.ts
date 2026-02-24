'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase/server'
import { getStripeAdmin } from '@/lib/stripe/stripe'

function getBaseUrlFromHeaders(h: Headers): string {
  const host = h.get('x-forwarded-host') || h.get('host')
  const proto = h.get('x-forwarded-proto') || 'https'
  if (!host) throw new Error('Missing host')
  return `${proto}://${host}`
}

export async function createBillingCheckoutSession(tenantSlug: string, priceId: string) {
  const supabase = await createServerSupabase()
  const sb: any = supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: tenant, error: tErr } = await supabase
    .from('tenants')
    .select('id, slug')
    .eq('slug', tenantSlug)
    .single()
  if (tErr) throw tErr

  const tenantId = (tenant as any).id as string

  // Ensure caller is an owner/admin
  const { data: membership } = await supabase
    .from('tenant_memberships')
    .select('role')
    .match({ tenant_id: tenantId, user_id: user.id })
    .maybeSingle()

  const role = (membership as any)?.role as string | undefined
  if (!role || !['owner', 'admin', 'tech'].includes(role)) {
    throw new Error('Not authorized')
  }

  const stripe = getStripeAdmin()
  const h = await headers()
  const baseUrl = getBaseUrlFromHeaders(h)

  // Get/create Stripe customer for tenant
  const { data: existing } = await sb
    .from('stripe_customers')
    .select('customer_id')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  let customerId = (existing as any)?.customer_id as string | undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        tenant_id: tenantId,
      },
    })
    customerId = customer.id

    await sb.from('stripe_customers').insert({ tenant_id: tenantId, customer_id: customerId })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/dashboard/${tenantSlug}/billing?status=success`,
    cancel_url: `${baseUrl}/dashboard/${tenantSlug}/billing?status=cancel`,
    subscription_data: {
      metadata: { tenant_id: tenantId },
    },
    metadata: { tenant_id: tenantId },
  })

  if (!session.url) throw new Error('Missing checkout url')
  redirect(session.url)
}

export async function createBillingPortalSession(tenantSlug: string) {
  const supabase = await createServerSupabase()
  const sb: any = supabase
  const { data: tenant, error: tErr } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single()
  if (tErr) throw tErr

  const tenantId = (tenant as any).id as string
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: membership } = await supabase
    .from('tenant_memberships')
    .select('role')
    .match({ tenant_id: tenantId, user_id: user.id })
    .maybeSingle()

  const role = (membership as any)?.role as string | undefined
  if (!role || !['owner', 'admin', 'tech'].includes(role)) {
    throw new Error('Not authorized')
  }

  const { data: existing } = await sb
    .from('stripe_customers')
    .select('customer_id')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  const customerId = (existing as any)?.customer_id as string | undefined
  if (!customerId) throw new Error('No Stripe customer for tenant')

  const stripe = getStripeAdmin()
  const h = await headers()
  const baseUrl = getBaseUrlFromHeaders(h)

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/dashboard/${tenantSlug}/billing`,
  })

  redirect(portal.url)
}
