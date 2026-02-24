import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  // Next 15+ / Next 16: cookies() is async.
  const cookieStore = await cookies()
  const hasCookieHeader = !!cookieStore.getAll().length;

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ hasCookieHeader, user: null })
  }

  return NextResponse.json({
    hasCookieHeader,
    user: {
      id: user.id,
      email: user.email,
    },
  })
}
