import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  CalDavServerPrincipal,
  CalDavSyncOverview,
} from '../caldav-sync-types'

// Local tag constants (kept in-slice like resources-api to stay mock-friendly)
const CALDAV_CONNECTION_SLICE = 'caldav_connection'
const CALDAV_SYNC_SLICE = 'caldav_sync'

/**
 * CalDAV & Sync RTK Query API (spec: caldav).
 *
 * Backend routes (protocol-level; the frontend uses a small JSON projection
 * served under the user API tree):
 *   GET /calendars/caldav/connection   → principal + discovery info
 *   GET /calendars/caldav/overview     → per-calendar sync status
 */

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    // ── CalDAV connection / discovery info ──────────────────────────
    getCalDavConnection: builder.query<CalDavServerPrincipal, void>({
      query: () => ({ url: 'calendars/caldav/connection' }),
      providesTags: () => [{ type: CALDAV_CONNECTION_SLICE, id: 'ME' }],
    }),

    // ── CalDAV sync overview (per-calendar status) ───────────────────
    getCalDavSyncOverview: builder.query<CalDavSyncOverview, void>({
      query: () => ({ url: 'calendars/caldav/overview' }),
      providesTags: () => [{ type: CALDAV_SYNC_SLICE, id: 'OVERVIEW' }],
    }),
  }),
})

export const {
  useGetCalDavConnectionQuery,
  useGetCalDavSyncOverviewQuery,
} = injectedEndpoints

// Re-exported for selector helpers in components AND for structural tests to
// inspect the evaluated endpoint definitions without asserting mock call history.
export { injectedEndpoints }
export const caldavSyncApiEndpoints = injectedEndpoints.endpoints
