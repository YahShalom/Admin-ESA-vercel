
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const rootDomain = "carai.agency";
  const cleanHost = host.split(":")[0];

  const isAdminDomain = cleanHost === "admin.carai.agency" || cleanHost === rootDomain;
  const isSubdomain = cleanHost.endsWith(`.${rootDomain}`) && !isAdminDomain;
  const isCustomDomain = !cleanHost.endsWith(rootDomain) && !cleanHost.includes("localhost") && !cleanHost.includes("vercel.app");

  if (isSubdomain || isCustomDomain) {
    const url = request.nextUrl.clone();
    url.pathname = `/site${request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
