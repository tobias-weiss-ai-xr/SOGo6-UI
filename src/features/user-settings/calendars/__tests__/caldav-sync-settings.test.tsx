// @ts-nocheck
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
}))

const mockConnection = {
  email: 'sogo-tests1@example.org',
  server_url: 'https://sogo6.localhost/',
  calendar_home_path: '/caldav/calendars/sogo-tests1@example.org/',
  dav_capabilities: '1, 2, 3, calendar-access, calendar-schedule, extended-mkcol',
  supported_components: ['VEVENT', 'VTODO'],
}

const mockOverview = {
  principal: mockConnection,
  calendars: [
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
      discoverable: false,
      event_count: 0,
    },
  ],
  total_events: 12,
}

jest.mock('@/features/caldav-sync/store/caldav-sync-api', () => ({
  useGetCalDavConnectionQuery: () => ({ data: mockConnection, isLoading: false }),
  useGetCalDavSyncOverviewQuery: () => ({ data: mockOverview, isLoading: false }),
}))

describe('CalDavSyncSettings', () => {
  it('renders the title', async () => {
    const Component = (await import('@/features/user-settings/calendars/caldav-sync-settings')).default
    render(<Component />)
    expect(screen.getByText('title.string')).toBeTruthy()
  })

  it('renders connection URLs', async () => {
    const Component = (await import('@/features/user-settings/calendars/caldav-sync-settings')).default
    render(<Component />)
    expect(screen.getByText('https://sogo6.localhost/')).toBeTruthy()
    expect(screen.getByText('/caldav/calendars/sogo-tests1@example.org/')).toBeTruthy()
  })

  it('renders supported components', async () => {
    const Component = (await import('@/features/user-settings/calendars/caldav-sync-settings')).default
    render(<Component />)
    expect(screen.getByText('VEVENT, VTODO')).toBeTruthy()
  })

  it('renders per-calendar sync status', async () => {
    const Component = (await import('@/features/user-settings/calendars/caldav-sync-settings')).default
    render(<Component />)
    expect(screen.getByText('Personal')).toBeTruthy()
    expect(screen.getByText('Work')).toBeTruthy()
    expect(screen.getByTestId('discoverable')).toBeTruthy()
    expect(screen.getByTestId('not-discoverable')).toBeTruthy()
  })
})