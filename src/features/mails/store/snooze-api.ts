import { createApiNotificationHandler } from '@/features/notifications/api-notification-handler'
import {
  apiSlice,
  MAIL_SLICE,
} from '@/lib/redux/api/api-slice'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'

export const SNOOZE_SLICE = 'snooze'

export interface SnoozeRecord {
  id: number
  user_uid: string
  mail_uid: string
  folder: string
  original_folder: string
  snooze_until: string
  created_at: string
  account_id: string
}

export interface SnoozeCreatePayload {
  account_id: string
  mail_uids: string[]
  folder: string
  snooze_until?: string
  preset?: 'later_today' | 'tomorrow' | 'this_weekend' | 'next_week'
}

const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    snoozeMails: builder.mutation<SnoozeRecord[], SnoozeCreatePayload>({
      query: (body) => ({
        url: '/mail/v1/snooze/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [SNOOZE_SLICE],
    }),

    getSnoozedMails: builder.query<SnoozeRecord[], void>({
      query: () => ({
        url: '/mail/v1/snooze/',
        method: 'GET',
      }),
      providesTags: [SNOOZE_SLICE],
    }),

    unsnoozeMail: builder.mutation<{ restored: SnoozeRecord }, number>({
      query: (snoozeId) => ({
        url: `/mail/v1/snooze/${snoozeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [SNOOZE_SLICE],
    }),
  }),
  overrideExisting: true,
})

export const {
  useSnoozeMailsMutation,
  useGetSnoozedMailsQuery,
  useUnsnoozeMailMutation,
} = injectedEndpoints
