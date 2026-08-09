import { NextResponse } from 'next/server'

// Fake in-memory store for student groups
const fakeGroups: Record<string, any> = {}
const fakeMembers: Record<string, string[]> = {}

// GET /admin/v1/student-groups – list
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/student-groups')
  }
  return NextResponse.json({
    success: true,
    data: Object.values(fakeGroups),
  })
}

// POST /admin/v1/student-groups – create
export async function POST(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/student-groups', body)
  }
  const gid = `fake-gid-${Date.now()}`
  fakeGroups[gid] = { ...body, id: gid, member_count: 0, created_at: new Date().toISOString() }
  fakeMembers[gid] = []
  return NextResponse.json({ success: true, data: fakeGroups[gid] }, { status: 201 })
}
