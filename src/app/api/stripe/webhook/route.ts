import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeAdmin } from '@/lib/stripe/stripe'
import { createServiceSupabase } from '@/lib/supabase/service'

export const runtime = 'nodejs'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing ${name}`)
  return v
}

export async function POST(req: Request) {
  const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET')

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    const stripe = getStripeAdmin()
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err?.message ?? 'unknown'}` }, { status: 400 })
  }

  const supabase = createServiceSupabase()
  const sb: any = supabase

  // Idempotency guard
  const { error: idemErr } = await sb.from('stripe_events').insert({ event_id: event.id })
  if (idemErr) {
    // If duplicate key, ignore. Otherwise surface.
    if ((idemErr as any).code !== '23505') {
      return NextResponse.json({ error: 'Failed to record event', details: idemErr }, { status: 500 })
    }
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        // We only upsert when metadata.tenant_id exists
        const tenantId = (customer.metadata?.tenant_id || '').trim()
        if (tenantId) {
          await sb
            .from('stripe_customers')
            .upsert({ tenant_id: tenantId, customer_id: customer.id })
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const tenantId = (session.metadata?.tenant_id || '').trim()
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        if (tenantId && customerId) {
          await sb.from('stripe_customers').upsert({ tenant_id: tenantId, customer_id: customerId })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const tenantId = (sub.metadata?.tenant_id || '').trim()

        // Some setups store tenant_id on customer metadata instead. If missing, attempt lookup.
        let resolvedTenantId = tenantId
        if (!resolvedTenantId && typeof sub.customer === 'string') {
          const { data: mapping } = await sb
            .from('stripe_customers')
            .select('tenant_id')
            .eq('customer_id', sub.customer)
            .maybeSingle()
          if (mapping?.tenant_id) resolvedTenantId = mapping.tenant_id
        }

        if (resolvedTenantId) {
          const priceId = sub.items.data[0]?.price?.id ?? null
          const currentPeriodEnd = sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null

          await sb.from('stripe_subscriptions').upsert({
            subscription_id: sub.id,
            tenant_id: resolvedTenantId,
            status: sub.status,
            price_id: priceId,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: !!sub.cancel_at_period_end,
          })
        }
        break
      }

      default:
        // ignore
        break
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook handler failed', message: err?.message ?? 'unknown' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
