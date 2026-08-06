import {
  apiSlice,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import type {
  BackendResponse,
} from '@/features/mails/store/mail-api-types'
import type {
  GlobalSearchArg,
  GlobalSearchResult,
} from '../global-search-types'

const GLOBAL_SEARCH_SLICE = 'global_search'

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    // GET /search/global?q= — unified Cmd+K search across contacts,
    // calendar events and directory users.
    globalSearch: builder.query<
      GlobalSearchResult,
      GlobalSearchArg
    >({
      query: ({ q, limit = 8 }) => ({
        url: 'search/global',
        params: { q, limit },
      }),
      transformResponse: (response?: BackendResponse<GlobalSearchResult>) =>
        response?.data ?? { contacts: [], events: [], users: [] },
      keepUnusedDataFor: 30,
      providesTags: (_result, _error, { q }) => [
        { type: GLOBAL_SEARCH_SLICE, id: q },
      ],
    }),
  }),
  overrideExisting: true,
})

export const {
  useGlobalSearchQuery,
} = injectedEndpoints

export const globalSearchApiEndpoints = injectedEndpoints.endpoints

export { GLOBAL_SEARCH_SLICE }
