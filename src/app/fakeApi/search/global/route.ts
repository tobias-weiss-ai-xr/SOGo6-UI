import { NextRequest, NextResponse } from 'next/server'

const MOCK_CONTACTS = [
  { key: 'c-alice', addressbook_key: 'ab-personal', fullname: 'Alice Dupont', email: 'alice@example.org' },
  { key: 'c-bob', addressbook_key: 'ab-personal', fullname: 'Bob Martin', email: 'bob@example.org' },
  { key: 'c-carol', addressbook_key: 'ab-work', fullname: 'Carol Chen', email: 'carol@example.org' },
]

const MOCK_EVENTS = [
  { key: 'e1', calendar_key: 'personal', title: 'Weekly sync', date_start: '2026-08-10T09:00:00Z', date_end: '2026-08-10T10:00:00Z' },
  { key: 'e2', calendar_key: 'work', title: 'Product demo', date_start: '2026-08-11T14:00:00Z', date_end: '2026-08-11T15:00:00Z' },
  { key: 'e3', calendar_key: 'personal', title: 'Dentist appointment', date_start: '2026-08-12T08:30:00Z', date_end: '2026-08-12T09:00:00Z' },
]

const MOCK_USERS = [
  { uid: 'alice@example.org', cn: 'Alice Dupont', mail: 'alice@example.org' },
  { uid: 'bob@example.org', cn: 'Bob Martin', mail: 'bob@example.org' },
  { uid: 'carol@example.org', cn: 'Carol Chen', mail: 'carol@example.org' },
]

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().toLowerCase()
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 8)

  if (q.length < 2) {
    return NextResponse.json({
      data: { contacts: [], events: [], users: [] },
      error_code: 0,
      error_msg: '',
    })
  }

  const contacts = MOCK_CONTACTS.filter(
    (c) => c.fullname.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  ).slice(0, limit)

  const events = MOCK_EVENTS.filter((e) => e.title.toLowerCase().includes(q)).slice(0, limit)

  const users = MOCK_USERS.filter(
    (u) => u.cn.toLowerCase().includes(q) || u.mail.toLowerCase().includes(q)
  ).slice(0, limit)

  return NextResponse.json({
    data: { contacts, events, users },
    error_code: 0,
    error_msg: '',
  })
}
