'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50)
}

export async function createTenant(formData: FormData) {
  const supabase = await createServerSupabase()
  const sb: any = supabase

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to create a project.' }
  }

  const name = formData.get('name') as string
  const plan = (formData.get('plan') as string) || 'starter'
  if (!name || name.trim().length === 0) {
    return { error: 'Project name is required.' }
  }

  // Use server-side RPC to create tenant, membership, initial credits, and audit trail
  const { data: tenantId, error: onboardErr } = await sb.rpc('onboard_tenant', {
    p_user_id: user.id,
    p_tenant_name: name,
    p_plan: plan,
  })

  if (onboardErr) {
    console.error('Error onboarding tenant:', onboardErr)
    if ((onboardErr as any).code === '23505') {
      return { error: 'A project with this name already exists. Please choose a different name.' }
    }
    return { error: 'Could not create the project. Please try again.' }
  }

  revalidatePath('/dashboard')
  
  return { success: true, tenantId }
}
