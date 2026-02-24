import { getEnv } from '@/lib/env'
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function createServiceSupabase() {
  const { NEXT_PUBLIC_SUPABASE_URL: url } = getEnv()
  const { SUPABASE_SERVICE_ROLE_KEY: key } = getEnv()

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
