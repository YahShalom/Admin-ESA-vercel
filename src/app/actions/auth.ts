'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { getSafeRequestOrigin } from '@/lib/http/origin'
import { getProxyContext } from '@/lib/http/proxy'

// In-memory store for rate limiting. In a production scenario, you'd use a persistent store like Redis.
const otpRequests = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_COUNT = 5

export async function requestMagicLink(formData: FormData) {
  const raw = formData.get('email')
  const email = typeof raw === 'string' ? raw.trim() : ''
  if (!email) {
    return redirect(`/login?error=${encodeURIComponent('Email is required')}`)
  }
  const { ip } = await getProxyContext()
  const ipKey = ip ?? '127.0.0.1'
  const rateLimitKey = `${email}:${ipKey}`

  const now = Date.now()
  // Get existing requests and filter out old ones
  const requests = (otpRequests.get(rateLimitKey) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  )

  if (requests.length >= RATE_LIMIT_COUNT) {
    return redirect(`/login?error=${encodeURIComponent('Too many requests. Please try again in 15 minutes.')}`)
  }
  
  const origin = await getSafeRequestOrigin()
  const emailRedirectTo = `${origin}/auth/callback`

  if (!emailRedirectTo.endsWith('/auth/callback')) {
    // This should ideally never happen with the current implementation of getSafeRequestOrigin
    return redirect(`/login?error=${encodeURIComponent('Could not construct a valid sign-in link.')}`)
  }

  const supabase = await createServerSupabase()

  console.log(JSON.stringify({ event: 'OTP_REQUEST_START', email, ip: ipKey, emailRedirectTo }))

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  })

  if (error) {
    console.log(JSON.stringify({ event: 'OTP_REQUEST_FAIL', email, ip: ipKey, message: error.message }))
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  console.log(JSON.stringify({ event: 'OTP_REQUEST_SUCCESS', email, ip: ipKey }))
  
  // Add current request timestamp for rate limiting
  requests.push(now)
  otpRequests.set(rateLimitKey, requests)

  return redirect('/login?message=Check%20your%20email%20for%20the%20magic%20link');
}

export async function signOut() {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    return redirect('/login');
}
