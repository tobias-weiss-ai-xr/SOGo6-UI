import { NextResponse } from 'next/server'

const fakeDonors: any[] = []

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/donor-management')
  }
  return NextResponse.json({ success: true, data: fakeDonors })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/donor-management', body)
  }
  const donor = {
    id: `donor-${Date.now()}`,
    ...body,
    created_at: new Date().toISOString(),
  }
  fakeDonors.push(donor)
  return NextResponse.json({ success: true, data: donor }, { status: 201 })
}
