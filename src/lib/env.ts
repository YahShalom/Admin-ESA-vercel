import { z } from 'zod'

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  ADMIN_ESA_CANONICAL_ORIGIN: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
})

export function getEnv() {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    // Fail fast in production; be noisy in dev.
		const msg = parsed.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid environment variables: ${msg}`)
  }
  return parsed.data
}
