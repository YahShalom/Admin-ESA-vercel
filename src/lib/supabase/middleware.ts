import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

import type { Database } from "@/types/supabase";

/**
 * Middleware-only Supabase client.
 * - Uses the ANON key (never service role).
 * - Propagates auth cookies from the incoming request onto the outgoing response.
 *
 * This follows the @supabase/ssr pattern that works with Next.js App Router + middleware.
 */
export function createMiddlewareSupabase(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail closed: if env is missing, do not try to refresh session in middleware.
    // Let the app handle the error surfaces server-side with clearer messaging.
    return {
      supabase: {
        auth: {
          // eslint-disable-next-line @typescript-eslint/require-await
          async getUser() {
            return { data: { user: null }, error: null };
          },
        },
      } as any,
      response: res,
    };
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  return { supabase, response: res };
}
