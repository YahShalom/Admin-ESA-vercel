import { getProxyContext } from './proxy'

/**
 * Produces a safe, stable origin for auth redirects.
 *
 * Priority:
 * 1) ADMIN_ESA_CANONICAL_ORIGIN (hard override)
 * 2) Proxy-derived request context (allowlisted)
 * 3) NEXT_PUBLIC_SITE_URL (fallback)
 */
export async function getSafeRequestOrigin(): Promise<string> {
  const canonical = process.env.ADMIN_ESA_CANONICAL_ORIGIN
  if (canonical) {
    try {
      const u = new URL(canonical)
      if (u.protocol === 'https:' || u.protocol === 'http:') return u.origin
    } catch {
      // ignore
    }
  }

  const ctx = await getProxyContext()
  return ctx.origin
}
