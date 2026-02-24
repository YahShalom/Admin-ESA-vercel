import { getEnv } from '@/lib/env'
import Stripe from 'stripe'

const key = getEnv().STRIPE_SECRET_KEY

export function getStripeAdmin(): Stripe {
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }
  return new Stripe(key, {
    apiVersion: '2024-06-20',
    typescript: true,
  })
}
