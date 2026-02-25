import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type"); // "magiclink" | "recovery" | etc

  const supabase = await createServerSupabase();

  // 1) PKCE flow (returns ?code=...)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "exchange_failed");
      loginUrl.searchParams.set("error_description", error.message);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  // 2) Token-hash flow (returns ?token_hash=...&type=magiclink)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (error) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "verify_failed");
      loginUrl.searchParams.set("error_description", error.message);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  // 3) Nothing usable
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "missing_code_or_token");
  loginUrl.searchParams.set(
    "error_description",
    "Auth callback missing code or token_hash."
  );
  return NextResponse.redirect(loginUrl);
}