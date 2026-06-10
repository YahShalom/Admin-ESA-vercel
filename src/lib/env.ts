import { z } from 'zod'

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  ADMIN_ESA_CANONICAL_ORIGIN: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
})

export function getEnv() {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    return Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key in serverSchema.shape)
    ) as Record<string, string | undefined>
  }
  return parsed.data
}
