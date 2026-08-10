import { NextResponse } from 'next/server'

const fakeScimUsers: any[] = []

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/scim')
  }
  return NextResponse.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: fakeScimUsers.length,
    Resources: fakeScimUsers,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/scim', body)
  }
  const user = {
    id: `scim-${Date.now()}`,
    userName: body.userName || `user_${Date.now()}`,
    meta: { resourceType: 'User', created: new Date().toISOString() },
    ...body,
  }
  fakeScimUsers.push(user)
  return NextResponse.json(user, { status: 201 })
}
