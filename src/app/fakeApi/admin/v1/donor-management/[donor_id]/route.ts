import { NextResponse } from 'next/server'

const fakeDonors: Record<string, any> = {}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ donor_id: string }> }
) {
  const { donor_id } = await params
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/donor-management/' + donor_id)
  }
  const donor = fakeDonors[donor_id]
  if (!donor) {
    return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: donor })
}
