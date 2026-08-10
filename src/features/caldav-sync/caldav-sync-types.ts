/**
 * CalDAV & Sync connection info types.
 *
 * Exposes read-only discovery/status info surfaced on the user-facing
 * "CalDAV & Sync" settings page (spec: caldav.spec.md / caldav-server.spec.md).
 */

/** Principal-level connection info for the authenticated user. */
export interface CalDavServerPrincipal {
  email: string
  /** Canonical server base URL, e.g. https://mail.example.com/ */
  server_url: string
  /** The user's calendar home set collection. */
  calendar_home_path: string
  /** The WebDAV capabilities advertized on the root (DAV header). */
  dav_capabilities: string
  /** iCalendar component types supported by new calendars. */
  supported_components: string[]
}

/** Per-calendar synchronization status. */
export interface CalDavCalendarSyncStatus {
  calendar_key: string
  calendar_name: string
  /** True when the calendar is reachable/servable over CalDAV. */
  discoverable: boolean
  event_count: number
  /** RFC 6578 sync-token the last full client sync produced. */
  last_sync_token?: string
  last_sync_at?: string
}

/** Aggregate response for the CalDAV & Sync settings page. */
export interface CalDavSyncOverview {
  principal: CalDavServerPrincipal
  calendars: CalDavCalendarSyncStatus[]
  total_events: number
}