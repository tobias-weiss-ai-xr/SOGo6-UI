import { NextResponse } from 'next/server'

const fakeBackups: any[] = []

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/backup')
  }
  return NextResponse.json({ success: true, data: fakeBackups })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] POST /admin/v1/backup', body)
  }
  const backup = {
    id: `backup-${Date.now()}`,
    status: 'completed',
    source: body.source || 'full',
    size_mb: Math.floor(Math.random() * 100),
    duration_s: Math.floor(Math.random() * 30),
    created_at: new Date().toISOString(),
    Manifest: { version: 1, sources: { redis: 'ok', ldap: 'ok', postgres: 'skipped' } },
  }
  fakeBackups.push(backup)
  return NextResponse.json({ success: true, data: backup }, { status: 201 })
}
