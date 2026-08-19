import type {
  ProfileApiResponse,
  ProfileData,
} from '@/features/user-profile/profile-types'
import type { SharedMailbox } from '@/features/admin-panel/store/admin-panel-api'
import { apiSlice, PROFILE_SLICE } from '@/lib/redux/api/api-slice'

/**
 * API slice for the /profile endpoint
 * Pattern: injectEndpoints into main apiSlice
 */
export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /profile
     * Fetches complete profile: mailboxes, preferences, UI settings
     */
    getUserProfile: builder.query<ProfileData, void>({
      query: () => ({
        url: 'profile',
        method: 'GET',
      }),

      /**
       * Transform backend response to usable format
       * Backend always returns {data: {...}, error_code, error_msg}
       */
      transformResponse: (response: ProfileApiResponse): ProfileData => {
        // Check for backend error
        if (response.error_code !== 'S000000') {
          throw new Error(response.error_msg || 'Profile fetch failed')
        }

        return response.data
      },

      // Tag for cache invalidation
      providesTags: [PROFILE_SLICE],

      // Cache 5 minutes (profile changes rarely)
      keepUnusedDataFor: 300,
    }),

    /**
     * GET /user/v1/shared-mailboxes
     * Fetches shared mailboxes that the current user has access to
     */
    getUserSharedMailboxes: builder.query<SharedMailbox[], void>({
      query: () => ({
        url: 'shared-mailboxes',
        method: 'GET',
      }),

      transformResponse: (response: { mailboxes: SharedMailbox[] }): SharedMailbox[] => {
        return response.mailboxes || []
      },

      // Tag for cache invalidation
      providesTags: ['SharedMailboxes'],

      // Cache 5 minutes
      keepUnusedDataFor: 300,
    }),

    /**
     * POST /profile/password
     * Changes the authenticated user's password.
     */
    changePassword: builder.mutation<
      { changed: boolean },
      { current_password: string; new_password: string }
    >({
      query: (body) => ({
        url: 'profile/password',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

// Export auto-generated hooks
export const {
  useGetUserProfileQuery,
  useChangePasswordMutation,
  useGetUserSharedMailboxesQuery,
} = profileApi
