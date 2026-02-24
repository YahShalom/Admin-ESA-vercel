'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function chargeCredits(tenantId: string, amount: number, reason: string, ref?: string) {
  const supabase = await createServerSupabase()
  const sb: any = supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await sb.rpc('charge_credits', {
    p_tenant_id: tenantId,
    p_amount: amount,
    p_reason: reason,
    p_ref: ref ?? null,
    p_meta: {},
  })

  if (error) throw error
  const balance = (data as any)?.[0]?.balance
  return { balance }
}
