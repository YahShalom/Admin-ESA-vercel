import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'missing_code');
    loginUrl.searchParams.set('error_description', 'The sign-in link is missing the required authentication code.');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createServerSupabase();
  const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Authentication error:', error.message);
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'exchange_failed');
    loginUrl.searchParams.set('error_description', error.message);
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    console.error('No user found after code exchange.');
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'internal_error');
    loginUrl.searchParams.set('error_description', 'Could not retrieve user after sign-in.');
    return NextResponse.redirect(loginUrl);
  }

  console.log(`User ${user.id} signed in.`);

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('slug')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (tenantError) {
    console.error(`Tenant lookup error for user ${user.id}:`, tenantError.message);
  }

  const tenantSlug = (tenant as { slug?: string } | null)?.slug;

  if (tenantSlug) {
    const redirectPath = `/${tenantSlug}/dashboard`;
    console.log(`Redirecting user ${user.id} to ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, origin));
  } else {
    const redirectPath = '/onboarding';
    console.log(`Redirecting user ${user.id} to ${redirectPath}`);
    return NextResponse.redirect(new URL(redirectPath, origin));
  }
}
