import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'missing_code')
    loginUrl.searchParams.set('error_description', 'The sign-in link is missing the required authentication code.')
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'exchange_failed')
    loginUrl.searchParams.set('error_description', 'The sign-in link may have expired or has already been used. Please request a new one.')
    return NextResponse.redirect(loginUrl)
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'user_not_found')
    loginUrl.searchParams.set('error_description', 'Could not verify your session. Please try signing in again.')
    return NextResponse.redirect(loginUrl)
  }

  const redirectTo = `${origin}/dashboard`
  return NextResponse.redirect(redirectTo)
}
