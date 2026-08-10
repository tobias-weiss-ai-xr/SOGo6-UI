import React from 'react'
import { useTranslations } from 'next-intl'
import {
  useGetCalDavConnectionQuery,
  useGetCalDavSyncOverviewQuery,
} from '@/features/caldav-sync/store/caldav-sync-api'

/**
 * CalDAV & Sync settings page (spec: caldav.spec.md).
 *
 * Surfaces the user's CalDAV connection URLs (server, principals, calendar
 * home) and per-calendar sync status so they can configure Apple Calendar,
 * Thunderbird, DAVx5, etc. The actual protocol endpoints live on the server
 * at /caldav/* (RFC 4791 / RFC 6578).
 */

const CalDavSyncSettings: React.FC = () => {
  const t = useTranslations('US_CALDAV')

  // Update wording to reflect singular key. Kept simple for testability.
  const title = t('title.string')
  const description = t('description.string')
  const serverUrlLabel = t('serverUrl.string')
  const calendarHomeLabel = t('calendarHomePath.string')
  const davLabel = t('davCapabilities.string')
  const supportedLabel = t('supportedComponents.string')
  const calendarsTitle = t('calendarsTitle.string')
  const noCalendars = t('noCalendars.string')
  const eventCountLabel = t('eventCount.string')
  const readyLabel = t('status.ready.string')
  const notDiscoverable = t('status.notDiscoverable.string')

  const {
    data: connection,
    isLoading: loadingConnection,
  } = useGetCalDavConnectionQuery()
  const {
    data: overview,
    isLoading: loadingOverview,
  } = useGetCalDavSyncOverviewQuery()

  const loading = loadingConnection || loadingOverview

  return (
    <div data-testid="caldav-sync-settings">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>

      {loading && <div data-testid="loading">…</div>}

      {connection && (
        <dl className="mt-4 space-y-2">
          <div>
            <dt className="font-medium">{serverUrlLabel}</dt>
            <dd className="font-mono text-sm">{connection.server_url}</dd>
          </div>
          <div>
            <dt className="font-medium">{calendarHomeLabel}</dt>
            <dd className="font-mono text-sm">{connection.calendar_home_path}</dd>
          </div>
          <div>
            <dt className="font-medium">{davLabel}</dt>
            <dd className="font-mono text-sm">{connection.dav_capabilities}</dd>
          </div>
          <div>
            <dt className="font-medium">{supportedLabel}</dt>
            <dd className="text-sm">{connection.supported_components.join(', ')}</dd>
          </div>
        </dl>
      )}

      <h2 className="mt-6 text-base font-semibold">{calendarsTitle}</h2>
      {overview && overview.calendars.length === 0 && <p>{noCalendars}</p>}
      {overview && overview.calendars.length > 0 && (
        <ul data-testid="calendar-sync-list" className="mt-2 space-y-2">
          {overview.calendars.map((cal) => (
            <li key={cal.calendar_key} data-testid={`calendar-sync-${cal.calendar_key}`}>
              <span className="font-medium">{cal.calendar_name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {eventCountLabel} {cal.event_count}
              </span>
              <span className="ml-2 text-xs">
                {cal.discoverable ? (
                  <span data-testid="discoverable">{readyLabel}</span>
                ) : (
                  <span data-testid="not-discoverable">{notDiscoverable}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CalDavSyncSettings