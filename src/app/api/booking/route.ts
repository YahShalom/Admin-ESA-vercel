import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  return NextResponse.json({
    ok: true,
    message: 'Booking request received.',
    payload: body,
  })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Booking API is ready.' })
}
