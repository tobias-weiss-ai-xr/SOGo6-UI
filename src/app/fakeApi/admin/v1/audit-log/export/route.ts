import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'jsonl'
  if (process.env.NODE_ENV === 'development') {
    console.log('[fakeApi] GET /admin/v1/audit-log/export?format=' + format)
  }
  const mockLog = format === 'cef'
    ? 'CEF:0|SOGo|sogo6|1.0|100|user action|10|src=10.0.0.1'
    : JSON.stringify({ time: new Date().toISOString(), action: 'test', user: 'admin' })
  return new NextResponse(mockLog, {
    status: 200,
    headers: { 'Content-Type': format === 'cef' ? 'text/plain' : 'application/x-ndjson' },
  })
}
