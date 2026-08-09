import { NextResponse } from 'next/server'

const fakeLimits: Record<string, any> = {}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/usage-quotas/' + uid)
  }
  const limits = fakeLimits[uid]
  return NextResponse.json({
    success: true,
    data: {
      uid,
      limits: limits || {},
      usage: { mailbox_used_mb: 0, calendar_count: 0, contact_count: 0 },
    },
  })
}
