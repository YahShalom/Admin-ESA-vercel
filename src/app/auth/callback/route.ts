import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const supabase = await createServerSupabase()

  // Unified flow: Exchange code or verify OTP, then get user
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error exchanging code for session:', error)
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('error', 'exchange_failed')
      loginUrl.searchParams.set('error_description', error.message)
      return NextResponse.redirect(loginUrl)
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash })
    if (error) {
      console.error('Error verifying OTP:', error)
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('error', 'verify_failed')
      loginUrl.searchParams.set('error_description', error.message)
      return NextResponse.redirect(loginUrl)
    }
  } else {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'missing_code_or_token')
    loginUrl.searchParams.set(
      'error_description',
      'Auth callback missing code or token_hash.'
    )
    return NextResponse.redirect(loginUrl)
  }

  // After successful auth, get the user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('Error getting user after auth:', userError)
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'user_not_found')
    loginUrl.searchParams.set(
      'error_description',
      'Could not find user after authentication. Please try again.'
    )
    return NextResponse.redirect(loginUrl)
  }

  console.log('Successfully authenticated user:', user.id, user.email)

  // Check for an existing tenant for the user
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('slug')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (tenantError) {
    console.error('Error querying for tenant:', tenantError)
    // Decide how to handle this - redirect to error, or onboarding?
    // For now, redirecting to onboarding as a safe fallback.
    return NextResponse.redirect(new URL('/onboarding', origin))
  }

  if (tenant) {
    console.log(`Found tenant for user ${user.id}, redirecting to /${tenant.slug}/dashboard`)
    return NextResponse.redirect(new URL(`/${tenant.slug}/dashboard`, origin))
  } else {
    console.log(`No tenant found for user ${user.id}, redirecting to /onboarding`)
    return NextResponse.redirect(new URL('/onboarding', origin))
  }
}
