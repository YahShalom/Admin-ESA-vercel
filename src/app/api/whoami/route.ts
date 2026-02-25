import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return NextResponse.json({ ok: !!user, userId: user?.id ?? null });
}
