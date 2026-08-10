import { NextResponse } from 'next/server'
const fakeMembers: Record<string, string[]> = {}

export async function POST(request: Request) {
  const body = await request.json()
  const group_id = body.group_id
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/student-groups/drop', body)
  }
  const emails = body.emails || []
  if (fakeMembers[group_id]) {
    fakeMembers[group_id] = fakeMembers[group_id].filter(e => !emails.includes(e))
  }
  return NextResponse.json({ success: true, data: { removed: emails, total: fakeMembers[group_id]?.length || 0 } })
}
