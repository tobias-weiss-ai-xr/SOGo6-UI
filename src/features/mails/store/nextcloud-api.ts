import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'

export interface NextcloudFile {
  name: string
  type: 'folder' | 'file'
  size: number
  modified: string | number
}

export interface NextcloudBrowseResponse {
  path: string
  files: NextcloudFile[]
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    exchangeNextcloudToken: builder.mutation<{ access_token: string; token_type: string; expires_in: number; scopes: string[] }, { scopes?: string[] }>({
      query: (body) => ({
        url: 'nextcloud/token/exchange',
        method: 'POST',
        body,
      }),
    }),

    browseNextcloudFiles: builder.query<NextcloudBrowseResponse, { token: string; path?: string; type?: string }>({
      query: ({ token, path, type }) => ({
        url: 'nextcloud/files/browse',
        method: 'GET',
        params: { path: path || '/', type: type || 'all' },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    }),
  }),
})

export const { useExchangeNextcloudTokenMutation, useBrowseNextcloudFilesQuery } =
  injectedEndpoints

export default injectedEndpoints
