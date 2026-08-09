import { NextResponse } from 'next/server'

const fakeLimits: Record<string, any> = {}

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/usage-quotas')
  }
  return NextResponse.json({
    success: true,
    data: Object.entries(fakeLimits).map(([uid, limits]) => ({
      uid,
      limits,
      usage: { mailbox_used_mb: 0, calendar_count: 0, contact_count: 0 },
      over_quota: false,
    })),
  })
}

export async function PUT(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] PUT /admin/v1/usage-quotas', body)
  }
  const uid = body.uid
  fakeLimits[uid] = body.limits
  return NextResponse.json({ success: true, data: { uid, limits: body.limits } })
}
