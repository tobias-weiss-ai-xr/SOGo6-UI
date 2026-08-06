import { apiSlice } from '@/lib/redux/api/api-slice'
import type { EndpointBuilder } from '@reduxjs/toolkit/query'
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react'

// Resource Types
export type ResourceType = 'room' | 'equipment' | 'vehicle' | 'other'
export type BookingPolicy = 'open' | 'moderated' | 'restricted'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'rejected'

// Resource entity from backend
export type Resource = {
  id: string
  name: string
  description: string | null
  email: string | null
  resource_type: ResourceType
  capacity: number | null
  location: string | null
  features: string[] | null
  is_active: boolean
  booking_policy: BookingPolicy
  auto_accept: boolean
  created_at: string | null
  updated_at: string | null
  allowed_groups: string[] | null
  is_favorite: boolean
}

// Resource with availability info
export type ResourceWithAvailability = Resource & {
  is_available: boolean
  next_available: string | null
}

// Time range for availability checks
export type TimeRange = {
  start_time: string // ISO 8601 datetime
  end_time: string // ISO 8601 datetime
  timezone?: string // IANA timezone identifier
}

// Availability check request
export type AvailabilityCheckRequest = TimeRange

// Availability check response
export type AvailabilityCheckResponse = {
  available: boolean
  resource_id: string
  resource_name: string
  start_time: string
  end_time: string
  conflicts: Record<string, unknown>[]
}

// Book resource request
export type BookResourceRequest = TimeRange & {
  title: string
  description?: string
  calendar_id?: string
  is_online_meeting?: boolean
  online_meeting_link?: string
  location?: string
}

// Booking entity
export type Booking = {
  id: string
  resource_id: string
  resource_name: string
  event_id: string | null
  start_time: string
  end_time: string
  title: string
  status: BookingStatus
  organizer_id: string
  organizer_name: string | null
  created_at: string
}

// Booking creation response
export type BookingCreateResponse = {
  booking_id: string
  event_id: string | null
  calendar_event: Record<string, unknown> | null
  message: string
}

// Booking list response
export type BookingListResponse = {
  bookings: Booking[]
  total_count: number
}

// Resource list query parameters
export type ResourceListQuery = {
  resource_type?: ResourceType
  location?: string
  capacity_min?: number
  capacity_max?: number
  search?: string
  feature?: string
  limit?: number
  offset?: number
}

// API slice tag types
const RESOURCES_SLICE = '$user_v1_resources'
const RESOURCE_DETAIL_SLICE = (id: string) => `${RESOURCES_SLICE}_${id}`
const BOOKINGS_SLICE = 'user_v1_bookings'
const BOOKING_DETAIL_SLICE = (id: string) => `${BOOKINGS_SLICE}_${id}`

// Define the API endpoints
const injectedEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQueryFn, string, 'api'>) => ({
    // Get list of resources with optional filters
    getResources: builder.query<{ resources: Resource[]; total_count: number; limit: number; offset: number }, ResourceListQuery | void>({
      query: (query: ResourceListQuery | void) => {
        const params = new URLSearchParams()
        if (query) {
          if (query.resource_type) params.append('resource_type', query.resource_type)
          if (query.location) params.append('location', query.location)
          if (query.capacity_min !== undefined) params.append('capacity_min', String(query.capacity_min))
          if (query.capacity_max !== undefined) params.append('capacity_max', String(query.capacity_max))
          if (query.search) params.append('search', query.search)
          if (query.feature) params.append('feature', query.feature)
          if (query.limit !== undefined) params.append('limit', String(query.limit))
          if (query.offset !== undefined) params.append('offset', String(query.offset))
        }
        return {
          url: '/user/v1/resources',
          method: 'GET',
          params: params.toString() || undefined,
        }
      },
      providesTags: [RESOURCES_SLICE],
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as { resources: Resource[]; total_count: number; limit: number; offset: number }) ?? {
          resources: [],
          total_count: 0,
          limit: 50,
          offset: 0,
        }
      },
    }),

    // Get a single resource by ID
    getResource: builder.query<Resource, string>({
      query: (resourceId: string) => ({
        url: `/user/v1/resources/${resourceId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [RESOURCES_SLICE, RESOURCE_DETAIL_SLICE(id)],
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as Resource) ?? null
      },
    }),

    // Get resources available during a time range
    getAvailableResources: builder.query<{ resources: ResourceWithAvailability[]; total_count: number; start_time: string; end_time: string }, TimeRange>({
      query: (timeRange: TimeRange) => {
        const params = new URLSearchParams()
        params.append('start_time', timeRange.start_time)
        params.append('end_time', timeRange.end_time)
        if (timeRange.timezone) params.append('timezone', timeRange.timezone)
        return {
          url: '/user/v1/resources/available',
          method: 'GET',
          params: params.toString(),
        }
      },
      providesTags: [RESOURCES_SLICE],
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as { resources: ResourceWithAvailability[]; total_count: number; start_time: string; end_time: string }) ?? {
          resources: [],
          total_count: 0,
          start_time: timeRange.start_time,
          end_time: timeRange.end_time,
        }
      },
    }),

    // Check availability of a specific resource
    checkResourceAvailability: builder.mutation<AvailabilityCheckResponse, { resourceId: string } & AvailabilityCheckRequest>({
      query: ({ resourceId, ...body }: { resourceId: string } & AvailabilityCheckRequest) => ({
        url: `/user/v1/resources/${resourceId}/check-availability`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as AvailabilityCheckResponse) ?? { available: false, resource_id: resourceId, conflicts: [] }
      },
    }),

    // Book a resource (creates calendar event)
    bookResource: builder.mutation<BookingCreateResponse, { resourceId: string } & BookResourceRequest>({
      query: ({ resourceId, ...body }: { resourceId: string } & BookResourceRequest) => ({
        url: `/user/v1/resources/${resourceId}/book`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [RESOURCES_SLICE, BOOKINGS_SLICE],
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as BookingCreateResponse) ?? { booking_id: '', message: 'Booking created' }
      },
    }),

    // Get user's bookings
    getMyBookings: builder.query<BookingListResponse, void>({
      query: () => ({
        url: '/user/v1/resources/my-bookings',
        method: 'GET',
      }),
      providesTags: [BOOKINGS_SLICE],
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as BookingListResponse) ?? { bookings: [], total_count: 0 }
      },
    }),

    // Get a specific booking
    getMyBooking: builder.query<Booking, string>({
      query: (bookingId: string) => ({
        url: `/user/v1/resources/my-bookings/${bookingId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [BOOKINGS_SLICE, BOOKING_DETAIL_SLICE(id)],
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as Booking) ?? null
      },
    }),

    // Cancel a booking
    cancelBooking: builder.mutation<{ message: string; booking_id: string }, string>({
      query: (bookingId: string) => ({
        url: `/user/v1/resources/my-bookings/${bookingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [BOOKINGS_SLICE],
      transformResponse: (response: Record<string, unknown>) => {
        return (response?.data as { message: string; booking_id: string }) ?? { message: 'Booking cancelled', booking_id: bookingId }
      },
    }),
  }),
})

// Export hooks for usage in components
export const {
  useGetResourcesQuery,
  useGetResourceQuery,
  useGetAvailableResourcesQuery,
  useCheckResourceAvailabilityMutation,
  useBookResourceMutation,
  useGetMyBookingsQuery,
  useGetMyBookingQuery,
  useCancelBookingMutation,
} = injectedEndpoints

// Export lazy-loaded hooks for code splitting (optional)
export const {
  endpoints,
  select,
} = injectedEndpoints
