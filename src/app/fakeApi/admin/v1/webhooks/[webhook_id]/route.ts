import { NextResponse } from 'next/server'

const fakeWebhooks: Record<string, any> = {}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ webhook_id: string }> }
) {
  const { webhook_id } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/webhooks/' + webhook_id)
  }
  const wh = fakeWebhooks[webhook_id]
  if (!wh) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: wh })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ webhook_id: string }> }
) {
  const { webhook_id } = await params
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] PATCH /admin/v1/webhooks/' + webhook_id, body)
  }
  if (!fakeWebhooks[webhook_id]) fakeWebhooks[webhook_id] = {}
  Object.assign(fakeWebhooks[webhook_id], body)
  return NextResponse.json({ success: true, data: fakeWebhooks[webhook_id] })
}
