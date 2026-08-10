import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ backup_id: string }> }
) {
  const { backup_id } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/backup/' + backup_id + '/verify')
  }
  return NextResponse.json({
    success: true,
    data: { found: true, valid: true, checksum_mismatch: false, entries_count: 100 },
  })
}
