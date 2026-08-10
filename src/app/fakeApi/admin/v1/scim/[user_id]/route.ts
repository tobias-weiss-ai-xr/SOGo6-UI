import { NextResponse } from 'next/server'

const fakeScimUsers: Record<string, any> = {}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/scim/' + user_id)
  }
  const user = fakeScimUsers[user_id]
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  return NextResponse.json(user)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] PUT /admin/v1/scim/' + user_id, body)
  }
  if (!fakeScimUsers[user_id]) fakeScimUsers[user_id] = {}
  Object.assign(fakeScimUsers[user_id], body)
  fakeScimUsers[user_id].meta = { ...fakeScimUsers[user_id].meta, lastModified: new Date().toISOString() }
  return NextResponse.json(fakeScimUsers[user_id])
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] DELETE /admin/v1/scim/' + user_id)
  }
  delete fakeScimUsers[user_id]
  return NextResponse.json({}, { status: 204 })
}
