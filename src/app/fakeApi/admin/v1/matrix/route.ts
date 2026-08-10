import { NextResponse } from 'next/server'

const fakeMatrixLookup: Record<string, any> = {}

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/matrix')
  }
  return NextResponse.json({
    success: true,
    data: Object.values(fakeMatrixLookup),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/matrix', body)
  }
  const homeserver = body.homeserver || 'sogo.example.com'
  const seed = body.seed || 'fake_seed_' + Date.now()
  fakeMatrixLookup[homeserver] = { homeserver, seed }
  return NextResponse.json({ success: true, data: { homeserver, seed } }, { status: 201 })
}
