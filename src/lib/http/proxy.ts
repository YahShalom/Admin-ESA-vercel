import { headers } from 'next/headers'

/**
 * Request-derived network context for deployments behind proxies
 * (Firebase Studio / Cloud Workstations / Vercel / Cloudflare).
 *
 * Use this instead of relying on Next middleware for auth redirects & logging.
 */
export type ProxyContext = {
  origin: string
  host: string | null
  proto: string
  ip: string | null
  userAgent: string | null
}

/** Allowlist hostnames we accept to construct origin. */
function isAllowedHost(host: string): boolean {
  return (
    host === 'studio.firebase.google.com' ||
    host.endsWith('.firebase.google.com') ||
    host.endsWith('.cloudworkstations.dev') ||
    host.endsWith('.vercel.app') ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')
  )
}

export async function getProxyContext(): Promise<ProxyContext> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  let proto = h.get('x-forwarded-proto') ?? 'https'
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || null
  const userAgent = h.get('user-agent')

  const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  if (!host || !isAllowedHost(host)) {
    return { origin: fallbackOrigin, host: host ?? null, proto, ip, userAgent }
  }

  if (host.includes('cloudworkstations.dev')) proto = 'https'
  return { origin: `${proto}://${host}`, host, proto, ip, userAgent }
}

export function safeNextPath(nextPath: string | null): string {
  if (!nextPath) return '/dashboard'
  // Only allow same-origin relative paths
  if (!nextPath.startsWith('/')) return '/dashboard'
  if (nextPath.startsWith('//')) return '/dashboard'
  return nextPath
}
