import { apiSlice } from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'

export interface OpenCloudFile {
  name: string
  type: 'folder' | 'file'
  size: number
  modified: string | number
}

export interface OpenCloudBrowseResponse {
  path: string
  files: OpenCloudFile[]
  source?: string
}

export interface OpenCloudSelectResponse {
  file_path: string
  share_url: string
  action: string
  selected_by: string
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    exchangeOpenCloudToken: builder.mutation<{ access_token: string; token_type: string; expires_in: number; scopes: string[] }, { scopes?: string[] }>({
      query: (body) => ({
        url: '/api/user/v1/opencloud/token/exchange',
        method: 'POST',
        body,
      }),
    }),

    browseOpenCloudFiles: builder.query<OpenCloudBrowseResponse, { token: string; path?: string; type?: string }>({
      query: ({ token, path, type }) => ({
        url: '/api/user/v1/opencloud/files/browse',
        method: 'GET',
        params: { path: path || '/', type: type || 'all' },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    }),

    selectOpenCloudFile: builder.mutation<OpenCloudSelectResponse, { token: string; file_path: string; action?: string }>({
      query: ({ token, ...body }) => ({
        url: '/api/user/v1/opencloud/files/select',
        method: 'POST',
        body: { file_path: body.file_path, action: body.action || 'attach' },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    }),
  }),
})

export const {
  useExchangeOpenCloudTokenMutation,
  useBrowseOpenCloudFilesQuery,
  useSelectOpenCloudFileMutation,
} = injectedEndpoints

export default injectedEndpoints
