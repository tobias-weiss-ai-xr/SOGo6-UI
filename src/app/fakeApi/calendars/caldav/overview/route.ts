// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sogo6.localhost'

const DEMO_CALENDARS = [
  {
    calendar_key: 'personal',
    calendar_name: 'Personal',
    discoverable: true,
    event_count: 12,
    last_sync_token: 'urn:x-sogo6:sync:AbC123',
    last_sync_at: '2026-08-06T10:00:00Z',
  },
  {
    calendar_key: 'work',
    calendar_name: 'Work',
    discoverable: true,
    event_count: 5,
    last_sync_token: 'urn:x-sogo6:sync:XyZ789',
    last_sync_at: '2026-08-06T09:30:00Z',
  },
]

/**
 * GET /fakeApi/calendars/caldav/overview
 * Returns the CalDAV sync overview for the current user (demo).
 */
export async function GET(_req: NextRequest) {
  const principal = {
    email: 'sogo-tests1@example.org',
    server_url: `${BASE_URL}/`,
    calendar_home_path: `/caldav/calendars/sogo-tests1@example.org/`,
    dav_capabilities: '1, 2, 3, calendar-access, calendar-schedule, extended-mkcol',
    supported_components: ['VEVENT', 'VTODO'],
  }
  const total_events = DEMO_CALENDARS.reduce((sum, c) => sum + c.event_count, 0)
  return NextResponse.json({
    data: { principal, calendars: DEMO_CALENDARS, total_events },
  })
}