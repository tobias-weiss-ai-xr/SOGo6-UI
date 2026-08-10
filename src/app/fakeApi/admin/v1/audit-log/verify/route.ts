import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/audit-log/verify')
  }
  return NextResponse.json({
    success: true,
    data: {
      chain_valid: true,
      trimmed: false,
      broken: [],
    },
  })
}
