/**
 * Unit tests for resources-api.ts RTK Query endpoints
 * Resource Booking Feature - Tier 0 Foundation
 */

// Mock the api slice before importing
jest.mock('@/lib/redux/api/api-slice', () => {
  const mockInjectEndpoints = jest.fn()
  return {
    __mockInjectEndpoints: mockInjectEndpoints,
    apiSlice: {
      injectEndpoints: (config: any) => {
        mockInjectEndpoints(config)
        // The endpoints key is a builder function; invoke it with a stub builder
        const builder = {
          query: (definition: any) => ({ ...definition, __kind: 'query' }),
          mutation: (definition: any) => ({ ...definition, __kind: 'mutation' }),
        }
        const endpoints =
          typeof config.endpoints === 'function'
            ? config.endpoints(builder)
            : config.endpoints
        const hooks: Record<string, any> = {}
        Object.keys(endpoints).forEach(key => {
          hooks[`use${key[0].toUpperCase()}${key.slice(1)}`] = jest.fn()
        })
        return {
          endpoints,
          ...hooks,
          injectedEndpoints: {
            endpoints,
            ...hooks,
          },
        }
      },
    },
  }
})


// Access the mock fn from the mocked module
const mockInjectEndpoints = (jest.requireMock('@/lib/redux/api/api-slice') as any).__mockInjectEndpoints

// Load the module under test AFTER the mock is registered (require ensures ordering)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const resourcesApi = require('../store/resources-api') as typeof import('../store/resources-api')

// The mock returns the evaluated endpoints object (builder already invoked)
const capturedEndpoints = (resourcesApi as any).endpoints as Record<string, any>

// Types
import type {
  Resource,
  Booking,
  BookingStatus,
  BookingPolicy,
  ResourceType,
  TimeRange,
  AvailabilityCheckResponse,
  BookResourceRequest,
  BookingCreateResponse,
} from '../store/resources-api'

describe('resources-api.ts type definitions', () => {
  it('should define Resource type with all required fields', () => {
    const resource: Resource = {
      id: 'res-001',
      name: 'Conference Room A',
      description: null,
      email: 'room-a@example.org',
      resource_type: 'room',
      capacity: 20,
      location: 'Building A',
      features: ['projector'],
      is_active: true,
      booking_policy: 'open',
      auto_accept: true,
      created_at: null,
      updated_at: null,
      allowed_groups: null,
      is_favorite: false,
    }
    expect(resource.id).toBe('res-001')
    expect(resource.resource_type).toBe('room')
    expect(resource.is_active).toBe(true)
  })

  it('should define ResourceType union type', () => {
    const types: ResourceType[] = ['room', 'equipment', 'vehicle', 'other']
    expect(types).toHaveLength(4)
  })

  it('should define BookingPolicy union type', () => {
    const policies: Resource['booking_policy'][] = ['open', 'moderated', 'restricted']
    expect(policies).toHaveLength(3)
  })

  it('should define BookingStatus union type', () => {
    const statuses: Booking['status'][] = ['confirmed', 'pending', 'cancelled', 'rejected']
    expect(statuses).toHaveLength(4)
  })

  it('should define AvailabilityCheckResponse type', () => {
    const response: AvailabilityCheckResponse = {
      available: true,
      resource_id: 'res-001',
      resource_name: 'Room A',
      start_time: '2025-01-15T10:00:00Z',
      end_time: '2025-01-15T11:00:00Z',
      conflicts: [],
    }
    expect(response.available).toBe(true)
    expect(response.conflicts).toEqual([])
  })

  it('should define TimeRange type', () => {
    const range: TimeRange = { start_time: '2025-01-15T10:00:00Z', end_time: '2025-01-15T11:00:00Z', timezone: 'UTC' }
    expect(range.start_time).toBe('2025-01-15T10:00:00Z')
    expect(range.timezone).toBe('UTC')
  })

  it('should define BookResourceRequest extending TimeRange', () => {
    const request: BookResourceRequest = {
      start_time: '2025-01-15T10:00:00Z',
      end_time: '2025-01-15T11:00:00Z',
      title: 'Meeting',
    }
    expect(request.title).toBe('Meeting')
  })

  it('should define BookingCreateResponse type', () => {
    const response: BookingCreateResponse = {
      booking_id: 'booking-001',
      event_id: 'event-001',
      calendar_event: null,
      message: 'created',
    }
    expect(response.booking_id).toBe('booking-001')
  })
})

describe('resources-api.ts endpoint injection', () => {
  it('should call injectEndpoints with builder endpoints', () => {
    // Verify the injected endpoint definitions were captured
    expect(capturedEndpoints).toBeDefined()
    expect(Object.keys(capturedEndpoints).length).toBeGreaterThan(0)
  })

  it('should define all required endpoints', () => {
    const endpoints = capturedEndpoints
    const expected = [
      'getResources',
      'getResource',
      'getAvailableResources',
      'checkResourceAvailability',
      'bookResource',
      'getMyBookings',
      'getMyBooking',
      'cancelBooking',
    ]
    expected.forEach(name => {
      expect(endpoints[name]).toBeDefined()
    })
  })

  it('should expose query hooks for each endpoint', () => {
    const exportedNames = Object.keys(resourcesApi)
    const expectedHooks = [
      'useGetResourcesQuery',
      'useGetResourceQuery',
      'useGetAvailableResourcesQuery',
      'useCheckResourceAvailabilityMutation',
      'useBookResourceMutation',
      'useGetMyBookingsQuery',
      'useGetMyBookingQuery',
      'useCancelBookingMutation',
    ]
    expectedHooks.forEach(name => {
      expect(exportedNames).toContain(name)
    })
  })

  it('should expose endpoints and select exports', () => {
    expect(Object.keys(resourcesApi)).toContain('endpoints')
    expect(Object.keys(resourcesApi)).toContain('select')
  })
})

describe('resources-api.ts query builder configuration', () => {
  it('should define DNS resource query with correct queryFn', () => {
    const getResources = capturedEndpoints.getResources
    expect(typeof getResources.query).toBe('function')

    const result = getResources.query({ resource_type: 'room', search: 'conf', limit: 50, offset: 0 })
    expect(result.method).toBe('GET')
    expect(result.url).toBe('/user/v1/resources')
    expect(result.params).toContain('resource_type=room')
    expect(result.params).toContain('search=conf')
    expect(result.params).toContain('limit=50')
    expect(result.params).toContain('offset=0')
  })

  it('should return undefined params when no query filters provided', () => {
    const getResources = capturedEndpoints.getResources
    const result = getResources.query(undefined)
    expect(result.url).toBe('/user/v1/resources')
    expect(result.params).toBeUndefined()
  })

  it('should provide tags for resource list', () => {
    const getResources = capturedEndpoints.getResources
    expect(getResources.providesTags).toBeDefined()
  })

  it('should build URL for single resource GET with id', () => {
    const getResource = capturedEndpoints.getResource
    const result = getResource.query('res-001')
    expect(result.url).toBe('/user/v1/resources/res-001')
    expect(result.method).toBe('GET')
  })

  it('should invalidate cache after booking', () => {
    const bookResource = capturedEndpoints.bookResource
    expect(bookResource.invalidatesTags).toBeDefined()
  })
})