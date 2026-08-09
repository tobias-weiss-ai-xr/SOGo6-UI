import { NextResponse } from 'next/server'

// In-memory store (shared with parent route.ts)
const fakeGroups: Record<string, any> = {}
const fakeMembers: Record<string, string[]> = {}

// GET /admin/v1/student-groups/{group_id}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ group_id: string }> }
) {
  const { group_id } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/student-groups/' + group_id)
  }
  const group = fakeGroups[group_id]
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: { ...group, members: fakeMembers[group_id] || [] } })
}

// DELETE /admin/v1/student-groups/{group_id}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ group_id: string }> }
) {
  const { group_id } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] DELETE /admin/v1/student-groups/' + group_id)
  }
  delete fakeGroups[group_id]
  delete fakeMembers[group_id]
  return NextResponse.json({ success: true, data: { deleted: group_id } })
}
