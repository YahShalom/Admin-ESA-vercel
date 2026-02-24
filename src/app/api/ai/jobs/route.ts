import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getProxyContext } from '@/lib/http/proxy'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const sb: any = supabase
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as any
  if (!body?.tenant_id || !body?.kind) {
    return NextResponse.json({ error: 'missing tenant_id or kind' }, { status: 400 })
  }

  // Belt+suspenders: basic input size guard
  const input = body.input ?? {}
  const idempotency_key = typeof body.idempotency_key === 'string' ? body.idempotency_key : null
  const scope = body.scope === 'platform' ? 'platform' : 'tenant'

  const { origin, ip } = await getProxyContext()

  const { data, error } = await sb
    .from('ai_jobs')
    .insert({
      tenant_id: body.tenant_id,
      requested_by: user.id,
      scope,
      kind: String(body.kind),
      input,
      idempotency_key,
    })
    .select('id, status, created_at')
    .single()

  if (error) {
    console.log(JSON.stringify({ event: 'AI_JOB_CREATE_FAIL', tenant_id: body.tenant_id, kind: body.kind, ip, origin, message: error.message }))
    return NextResponse.json({ error: 'insert_failed', message: error.message }, { status: 400 })
  }

  console.log(JSON.stringify({ event: 'AI_JOB_CREATED', job_id: data.id, tenant_id: body.tenant_id, kind: body.kind, ip, origin }))
  return NextResponse.json({ job: data })
}
