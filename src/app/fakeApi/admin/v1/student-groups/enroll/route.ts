import { NextResponse } from 'next/server'
const fakeMembers: Record<string, string[]> = {}

export async function POST(request: Request) {
  const body = await request.json()
  const group_id = body.group_id
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/student-groups/enroll', body)
  }
  if (!fakeMembers[group_id]) fakeMembers[group_id] = []
  const emails = body.emails || []
  fakeMembers[group_id].push(...emails)
  return NextResponse.json({ success: true, data: { added: emails, total: fakeMembers[group_id].length } })
}
