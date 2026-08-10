import { NextResponse } from 'next/server'

const fakeEntries: any[] = []

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/audit-log')
  }
  return NextResponse.json({
    success: true,
    data: fakeEntries.slice().reverse().slice(0, 100),
    total: fakeEntries.length,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/audit-log', body)
  }
  fakeEntries.push({ ...body, seq: fakeEntries.length, timestamp: new Date().toISOString() })
  return NextResponse.json({ success: true, data: { written: true } }, { status: 201 })
}
