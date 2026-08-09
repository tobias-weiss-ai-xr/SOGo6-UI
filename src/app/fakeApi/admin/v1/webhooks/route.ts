import { NextResponse } from 'next/server'

const fakeWebhooks: any[] = []

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/webhooks')
  }
  return NextResponse.json({ success: true, data: fakeWebhooks })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/webhooks', body)
  }
  const webhook = {
    id: `wh-${Date.now()}`,
    ...body,
    enabled: true,
    delivery_stats: { total: 0, success: 0, failed: 0 },
    created_at: new Date().toISOString(),
  }
  fakeWebhooks.push(webhook)
  return NextResponse.json({ success: true, data: webhook }, { status: 201 })
}
