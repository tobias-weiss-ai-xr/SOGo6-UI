/**
 * Resource Booking Types
 * 
 * This file contains TypeScript type definitions for the Resource Booking feature.
 * All types related to resources, bookings, and availability are defined here.
 */

// ============================================================================
// Enums
// ============================================================================

/** Resource types supported by the system */
export type ResourceType = 'room' | 'equipment' | 'vehicle' | 'other'

/** Booking policies for resources */
export type BookingPolicy = 'open' | 'moderated' | 'restricted'

/** Booking/action states */
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'rejected'

/** Resource sort options */
export type ResourceSortBy = 'name' | 'location' | 'capacity' | 'type' | 'created_at'

/** Resource filter options */
export type ResourceFilterType = ResourceType | 'all'

// ============================================================================
// Core Interfaces
// ============================================================================

/** 
 * Represents a bookable resource (room, equipment, vehicle, etc.)
 * This matches the backend schema from sogo6_resources table
 */
export interface Resource {
  /** Unique identifier for the resource */
  id: string
  
  /** Human-readable name */
  name: string
  
  /** Description of the resource */
  description: string | null
  
  /** Email address for the resource (iCalendar-style) */
  email: string | null
  
  /** Type of resource */
  resource_type: ResourceType
  
  /** Maximum capacity (for rooms/vehicles) */
  capacity: number | null
  
  /** Physical location */
  location: string | null
  
  /** List of features/amenities */
  features: string[] | null
  
  /** Whether the resource is active/available for booking */
  is_active: boolean
  
  /** Booking policy for this resource */
  booking_policy: BookingPolicy
  
  /** Whether bookings are auto-accepted or require moderation */
  auto_accept: boolean
  
  /** When the resource was created */
  created_at: string | null
  
  /** When the resource was last updated */
  updated_at: string | null
  
  /** LDAP groups allowed to book this resource (empty = all) */
  allowed_groups: string[] | null
  
  /** Whether this resource is in the user's favorites */
  is_favorite: boolean
}

/** 
 * Resource with additional availability information
 * Used when checking availability for a time range
 */
export interface ResourceWithAvailability extends Resource {
  /** Whether the resource is available during the requested time */
  is_available: boolean
  
  /** Next available time slot (ISO 8601) or null if available now */
  next_available: string | null
}

/** 
 * Minimal resource info for display in lists
 * Used for performance optimization (less data transferred)
 */
export interface ResourceSummary {
  id: string
  name: string
  resource_type: ResourceType
  location: string | null
  capacity: number | null
  is_active: boolean
  is_favorite: boolean
}

// ============================================================================
// Time & Date Types
// ============================================================================

/** 
 * Time range for availability checks and bookings
 * All times are in ISO 8601 format
 */
export interface TimeRange {
  /** Start time (ISO 8601 datetime) */
  start_time: string
  
  /** End time (ISO 8601 datetime) */
  end_time: string
  
  /** Optional timezone identifier (IANA timezone, e.g., 'America/New_York') */
  timezone?: string
}

/** 
 * Date range for calendar views
 * All dates are in ISO 8601 format (date only, no time)
 */
export interface DateRange {
  /** Start date (ISO 8601 date) */
  start_date: string
  
  /** End date (ISO 8601 date) */
  end_date: string
}

/** 
 * Date-time range with separate date and time components
 * Used for form inputs
 */
export interface DateTimeRange {
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  timezone?: string
}

// ============================================================================
// Availability Types
// ============================================================================

/** 
 * Request to check availability of a specific resource
 * Matches the backend AvailabilityCheckSchema
 */
export interface AvailabilityCheckRequest extends TimeRange {}

/** 
 * Response from availability check
 * Matches the backend AvailabilityResponseSchema
 */
export interface AvailabilityCheckResponse {
  /** Whether the resource is available */
  available: boolean
  
  /** Resource ID that was checked */
  resource_id: string
  
  /** Resource name */
  resource_name: string
  
  /** Start time that was checked */
  start_time: string
  
  /** End time that was checked */
  end_time: string
  
  /** List of conflicting events/bookings */
  conflicts: CalendarEventConflict[]
}

/** 
 * Information about a conflicting event/booking
 * Used when a resource is not available
 */
export interface CalendarEventConflict {
  /** Conflict ID or event ID */
  id: string
  
  /** Title of the conflicting event */
  title: string
  
  /** Start time of the conflict */
  start_time: string
  
  /** End time of the conflict */
  end_time: string
  
  /** Organizer of the conflicting event */
  organizer: string
  
  /** Status of the conflicting booking */
  status: BookingStatus
}

/** 
 * Time slot representation for availability calendar
 * Used in the availability grid view
 */
export interface AvailabilitySlot {
  /** Start time of the slot */
  start_time: string
  
  /** End time of the slot */
  end_time: string
  
  /** Whether the slot is available */
  available: boolean
  
  /** Resource ID for this slot (when viewing a specific resource) */
  resource_id?: string
  
  /** Booking ID if this slot is booked */
  booking_id?: string
}

// ============================================================================
// Booking Types
// ============================================================================

/** 
 * Booking entity representing a reservation of a resource
 * Matches the backend BookingSchema
 */
export interface Booking {
  /** Unique booking identifier */
  id: string
  
  /** Resource ID being booked */
  resource_id: string
  
  /** Resource name */
  resource_name: string
  
  /** Associated calendar event ID (if created) */
  event_id: string | null
  
  /** Start time of the booking */
  start_time: string
  
  /** End time of the booking */
  end_time: string
  
  /** Title of the booking/event */
  title: string
  
  /** Current status of the booking */
  status: BookingStatus
  
  /** User ID who made the booking */
  organizer_id: string
  
  /** Organizer's display name */
  organizer_name: string | null
  
  /** When the booking was created */
  created_at: string
}

/** 
 * Detailed booking information with additional fields
 * Used when viewing a specific booking
 */
export interface BookingDetails extends Booking {
  /** Description of the booking/event */
  description: string
  
  /** Location of the event */
  location: string | null
  
  /** Whether this is an online meeting */
  is_online_meeting: boolean
  
  /** Online meeting link */
  online_meeting_link: string | null
  
  /** Calendar ID where the event was created */
  calendar_id: string | null
  
  /** Resource details */
  resource: Resource | null
}

/** 
 * Request to book a resource
 * Matches the backend BookResourceSchema
 */
export interface BookResourceRequest extends TimeRange {
  /** Title for the booking/event */
  title: string
  
  /** Optional description */
  description?: string
  
  /** Calendar to create the event in (defaults to primary) */
  calendar_id?: string
  
  /** Whether this is an online meeting */
  is_online_meeting?: boolean
  
  /** Link for online meeting */
  online_meeting_link?: string
  
  /** Physical location for the event */
  location?: string
}

/** 
 * Response from booking creation
 * Matches the backend BookingCreateResponseSchema
 */
export interface BookingCreateResponse {
  /** ID of the created booking */
  booking_id: string
  
  /** ID of the created calendar event */
  event_id: string | null
  
  /** Full calendar event data */
  calendar_event: Record<string, unknown> | null
  
  /** Success message */
  message: string
}

/** 
 * Response from booking list endpoint
 * Matches the backend BookingListSchema
 */
export interface BookingListResponse {
  /** List of bookings */
  bookings: Booking[]
  
  /** Total count of bookings */
  total_count: number
}

/** 
 * Response from booking cancellation
 */
export interface BookingCancelResponse {
  /** Success message */
  message: string
  
  /** ID of the cancelled booking */
  booking_id: string
}

// ============================================================================
// Query & Filter Types
// ============================================================================

/** 
 * Query parameters for listing resources
 * Matches the backend ResourceListQuerySchema
 */
export interface ResourceListQuery {
  /** Filter by resource type */
  resource_type?: ResourceType
  
  /** Filter by location (substring match) */
  location?: string
  
  /** Minimum capacity */
  capacity_min?: number
  
  /** Maximum capacity */
  capacity_max?: number
  
  /** Search in name and description */
  search?: string
  
  /** Filter by feature (can be repeated for multiple features) */
  feature?: string
  
  /** Maximum number of results (1-500, default 50) */
  limit?: number
  
  /** Pagination offset (0-based) */
  offset?: number
}

/** 
 * Sort options for resource list
 */
export interface ResourceListSort {
  /** Field to sort by */
  by: ResourceSortBy
  
  /** Sort direction */
  direction: 'asc' | 'desc'
}

/** 
 * Filter state for the resource browser
 * Used to manage client-side filtering
 */
export interface ResourceFilterState {
  /** Selected resource types */
  types: ResourceType[]
  
  /** Search text */
  search: string
  
  /** Selected location filter */
  location: string
  
  /** Capacity range */
  capacity: {
    min: number | null
    max: number | null
  }
  
  /** Selected features */
  features: string[]
  
  /** Whether to show only available resources */
  availableOnly: boolean
  
  /** Whether to show only favorites */
  favoritesOnly: boolean
  
  /** Current sort option */
  sort: ResourceSortBy
  
  /** Sort direction */
  sortDirection: 'asc' | 'desc'
}

/** 
 * Query parameters for booking list
 */
export interface BookingListQuery {
  /** Filter by start time (inclusive) */
  start_time?: string
  
  /** Filter by end time (exclusive) */
  end_time?: string
  
  /** Filter by status */
  status?: BookingStatus
  
  /** Maximum number of results */
  limit?: number
  
  /** Pagination offset */
  offset?: number
}

// ============================================================================
// Calendar Integration Types
// ============================================================================

/** 
 * Event with attached resource bookings
 * Used when creating/updating calendar events with resources
 */
export interface CalendarEventWithResources {
  /** Event ID */
  id: string
  
  /** Event title */
  title: string
  
  /** Event description */
  description: string
  
  /** Start time */
  start: string
  
  /** End time */
  end: string
  
  /** Timezone */
  timezone: string
  
  /** Location */
  location: string
  
  /** Whether this is an online meeting */
  is_online_meeting: boolean
  
  /** Online meeting link */
  online_meeting_link: string | null
  
  /** Organizer */
  organizer: {
    email: string
    name: string
  }
  
  /** List of attendees (including resources) */
  attendees: CalendarAttendee[]
  
  /** Resource bookings attached to this event */
  x_resource_bookings?: ResourceBookingInfo[]
}

/** 
 * Calendar attendee (including resources)
 */
export interface CalendarAttendee {
  /** Email address */
  email: string
  
  /** Display name */
  name: string
  
  /** Role ( Chair, REQ-PARTICIPANT, OPT-PARTICIPANT, NON-PARTICIPANT ) */
  role: string
  
  /** Participation status */
  partstat: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'NEEDS-ACTION' | 'DELEGATED'
  
  /** Whether RSVP is required */
  rsvp: boolean
  
  /** Whether this attendee is a resource */
  x_resource?: boolean
}

/** 
 * Resource booking information attached to an event
 */
export interface ResourceBookingInfo {
  /** Resource ID */
  resource_id: string
  
  /** Resource name */
  resource_name: string
  
  /** Booking status */
  status: BookingStatus
}

// ============================================================================
// UI State Types
// ============================================================================

/** 
 * State for the resource selection modal/drawer
 */
export interface ResourceSelectionState {
  /** Whether the resource selector is open */
  open: boolean
  
  /** Time range for the booking */
  timeRange: TimeRange | null
  
  /** Currently selected resource IDs */
  selectedResourceIds: string[]
  
  /** Filter state for the resource list */
  filter: ResourceFilterState
  
  /** Whether to show availability calendar */
  showCalendar: boolean
}

/** 
 * State for the booking process
 */
export interface BookingState {
  /** Current step in the booking flow */
  step: 'select-resource' | 'check-availability' | 'confirm-details' | 'complete'
  
  /** Selected resource */
  resource: Resource | null
  
  /** Time range for the booking */
  timeRange: TimeRange | null
  
  /** Booking request data */
  bookingData: Partial<BookResourceRequest>
  
  /** Availability check result */
  availability: AvailabilityCheckResponse | null
  
  /** Whether a booking is in progress */
  isSubmitting: boolean
  
  /** Error message (if any) */
  error: string | null
  
  /** Success message after completion */
  successMessage: string | null
}

/** 
 * State for the resource browser page
 */
export interface ResourceBrowserState {
  /** Current view mode */
  viewMode: 'list' | 'grid' | 'calendar'
  
  /** Currently selected date */
  selectedDate: string | null
  
  /** Filter state */
  filter: ResourceFilterState
  
  /** Whether resources are being loaded */
  isLoading: boolean
  
  /** Error message (if any) */
  error: string | null
  
  /** Total number of resources matching filters */
  totalCount: number
}

/** 
 * View modes for resource browser
 */
export type ResourceViewMode = 'list' | 'grid' | 'calendar'

// ============================================================================
// Favorite Types
// ============================================================================

/** 
 * User's favorite resource
 */
export interface UserFavorite {
  /** User ID */
  user_id: string
  
  /** Resource ID */
  resource_id: string
  
  /** When the resource was favorited */
  created_at: string
  
  /** Display order (for sorting) */
  order: number
}

/** 
 * Request to add a resource to favorites
 */
export interface AddFavoriteRequest {
  resource_id: string
}

/** 
 * Request to remove a resource from favorites
 */
export interface RemoveFavoriteRequest {
  resource_id: string
}
