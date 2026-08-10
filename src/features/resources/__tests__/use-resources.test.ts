/**
 * Unit tests for use-resources.ts hooks
 * Resource Booking Feature - Tier 0 Foundation
 */

// Mock the resources API before importing hooks
jest.mock('../store/resources-api', () => ({
  useGetResourcesQuery: jest.fn(),
  useCheckResourceAvailabilityMutation: jest.fn(),
  useGetAvailableResourcesQuery: jest.fn(),
}))

import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useGetResourcesQuery,
  useCheckResourceAvailabilityMutation,
  useGetAvailableResourcesQuery,
} from '../store/resources-api'
import {
  useResources,
  useAvailableResources,
  useResourceAvailability,
  useResourcesByType,
  useBookableResources,
  useResourceSearch,
} from '../hooks/use-resources'

const mockedUseGetResourcesQuery = useGetResourcesQuery as jest.MockedFunction<typeof useGetResourcesQuery>
const mockedUseCheckAvailability = useCheckResourceAvailabilityMutation as jest.MockedFunction<typeof useCheckResourceAvailabilityMutation>
const mockedUseGetAvailableResourcesQuery = useGetAvailableResourcesQuery as jest.MockedFunction<typeof useGetAvailableResourcesQuery>

// Mock data
const mockResources = [
  {
    id: 'res-001',
    name: 'Conference Room A',
    resource_type: 'room',
    capacity: 20,
    is_active: true,
    features: ['projector', 'whiteboard'],
    description: null,
    email: 'room-a@example.org',
    location: 'Building A, Floor 1',
    booking_policy: 'open',
    auto_accept: true,
    created_at: null,
    updated_at: null,
    allowed_groups: null,
    is_favorite: false,
  },
  {
    id: 'res-002',
    name: 'Projector Cart',
    resource_type: 'equipment',
    capacity: null,
    is_active: true,
    features: ['projector'],
    description: null,
    email: 'proj@example.org',
    location: null,
    booking_policy: 'open',
    auto_accept: true,
    created_at: null,
    updated_at: null,
    allowed_groups: null,
    is_favorite: false,
  },
  {
    id: 'res-003',
    name: 'Boardroom',
    resource_type: 'room',
    capacity: 15,
    is_active: false,
    features: ['video_conference'],
    description: null,
    email: 'board@example.org',
    location: null,
    booking_policy: 'open',
    auto_accept: true,
    created_at: null,
    updated_at: null,
    allowed_groups: null,
    is_favorite: false,
  },
]

function mockQueryResult(overrides: Record<string, unknown> = {}) {
  return {
    data: { resources: mockResources, total_count: mockResources.length, limit: 100, offset: 0 },
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  }
}

describe('use-resources.ts Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==========================================================================
  // useResources - Get all active resources
  // ==========================================================================

  describe('useResources', () => {
    it('should return only active resources', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      const { result } = renderHook(() => useResources())

      expect(result.current.resources).toHaveLength(2)
      expect(result.current.resources.map(r => r.id)).toEqual(['res-001', 'res-002'])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should pass filter options to the query', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      renderHook(() => useResources({
        resourceType: 'room',
        search: 'conference',
        location: 'Building A',
        capacityMin: 10,
        limit: 50,
      }))

      expect(mockedUseGetResourcesQuery).toHaveBeenCalledWith({
        resource_type: 'room',
        search: 'conference',
        location: 'Building A',
        capacity_min: 10,
        feature: undefined,
        limit: 50,
        offset: 0,
      })
    })

    it('should return empty array when loading', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult({ isLoading: true, data: undefined }) as any)

      const { result } = renderHook(() => useResources())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.resources).toEqual([])
    })

    it('should expose error state', () => {
      const error = new Error('fetch failed')
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult({ isError: true, error, data: undefined }) as any)

      const { result } = renderHook(() => useResources())

      expect(result.current.isError).toBe(true)
      expect(result.current.error).toBe(error)
      expect(result.current.resources).toEqual([])
    })

    it('should expose refetch', () => {
      const refetch = jest.fn()
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult({ refetch }) as any)

      const { result } = renderHook(() => useResources())
      act(() => result.current.refetch())

      expect(refetch).toHaveBeenCalledTimes(1)
    })
  })

  // ==========================================================================
  // useAvailableResources - Get resources available for a time range
  // ==========================================================================

  describe('useAvailableResources', () => {
    const timeRange = { start: '2025-01-15T10:00:00Z', end: '2025-01-15T11:00:00Z' }

    it('should return available resources for a time range', () => {
      mockedUseGetAvailableResourcesQuery.mockReturnValue({
        data: { resources: [mockResources[0]], total_count: 1, start_time: timeRange.start, end_time: timeRange.end },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { result } = renderHook(() => useAvailableResources(timeRange))

      expect(mockedUseGetAvailableResourcesQuery).toHaveBeenCalledWith(timeRange)
      expect(result.current.availableResources).toEqual([mockResources[0]])
    })

    it('should return empty array on loading', () => {
      mockedUseGetAvailableResourcesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const { result } = renderHook(() => useAvailableResources(timeRange))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.availableResources).toEqual([])
    })
  })

  // ==========================================================================
  // useResourceAvailability - Check real-time availability of a resource
  // ==========================================================================

  describe('useResourceAvailability', () => {
    it('should return check function that calls the mutation', async () => {
      const trigger = jest.fn().mockReturnValue({
        unwrap: async () => ({ available: true, conflicts: [] }),
      })
      mockedUseCheckAvailability.mockReturnValue([trigger, { isLoading: false }] as any)

      const { result } = renderHook(() => useResourceAvailability())

      await act(async () => {
        const outcome = await result.current.checkAvailability({
          resourceId: 'res-001',
          start: '2025-01-15T10:00:00Z',
          end: '2025-01-15T11:00:00Z',
        })
        expect(outcome).toEqual({ available: true, conflicts: [] })
      })

      expect(trigger).toHaveBeenCalledWith({
        resourceId: 'res-001',
        start_time: '2025-01-15T10:00:00Z',
        end_time: '2025-01-15T11:00:00Z',
        exclude_booking_id: undefined,
      })
    })

    it('should return unavailable when the mutation fails', async () => {
      const trigger = jest.fn().mockReturnValue({
        unwrap: async () => {
          throw new Error('network error')
        },
      })
      mockedUseCheckAvailability.mockReturnValue([trigger, { isLoading: false }] as any)

      const { result } = renderHook(() => useResourceAvailability())

      let outcome: { available: boolean; conflicts: unknown[] } | undefined
      await act(async () => {
        outcome = await result.current.checkAvailability({
          resourceId: 'res-001',
          start: '2025-01-15T10:00:00Z',
          end: '2025-01-15T11:00:00Z',
        })
      })

      expect(outcome).toEqual({ available: false, conflicts: [] })
    })

    it('should pass excludeBookingId to the mutation', async () => {
      const trigger = jest.fn().mockReturnValue({
        unwrap: async () => ({ available: true, conflicts: [] }),
      })
      mockedUseCheckAvailability.mockReturnValue([trigger, { isLoading: false }] as any)

      const { result } = renderHook(() => useResourceAvailability())

      await act(async () => {
        await result.current.checkAvailability({
          resourceId: 'res-001',
          start: '2025-01-15T10:00:00Z',
          end: '2025-01-15T11:00:00Z',
          excludeBookingId: 'booking-001',
        })
      })

      expect(trigger).toHaveBeenCalledWith({
        resourceId: 'res-001',
        start_time: '2025-01-15T10:00:00Z',
        end_time: '2025-01-15T11:00:00Z',
        exclude_booking_id: 'booking-001',
      })
    })
  })

  // ==========================================================================
  // useResourcesByType - Get resources filtered by type
  // ==========================================================================

  describe('useResourcesByType', () => {
    it('should delegate to useResources with resourceType filter', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      const { result } = renderHook(() => useResourcesByType('room'))

      expect(mockedUseGetResourcesQuery).toHaveBeenCalledWith(expect.objectContaining({
        resource_type: 'room',
      }))
      // Query-level filtering happens server-side; active resources are returned as-is
      expect(result.current.resources.map(r => r.id)).toEqual(['res-001', 'res-002'])
    })

    it('should filter by equipment type via query params', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      renderHook(() => useResourcesByType('equipment'))

      expect(mockedUseGetResourcesQuery).toHaveBeenCalledWith(expect.objectContaining({
        resource_type: 'equipment',
      }))
    })
  })

  // ==========================================================================
  // useBookableResources - Get resources that can be booked
  // ==========================================================================

  describe('useBookableResources', () => {
    it('should return only active bookable resource types', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      const { result } = renderHook(() => useBookableResources())

      // Only active resources of type room/equipment/vehicle
      expect(result.current.resources.map(r => r.id)).toEqual(['res-001', 'res-002'])
    })

    it('should exclude inactive resources even if type is bookable', () => {
      const allActive = mockQueryResult()
      mockedUseGetResourcesQuery.mockReturnValue(allActive as any)

      const { result } = renderHook(() => useBookableResources())

      // res-003 is inactive so excluded
      expect(result.current.resources.map(r => r.id)).not.toContain('res-003')
    })
  })

  // ==========================================================================
  // useResourceSearch - Search resources by query
  // ==========================================================================

  describe('useResourceSearch', () => {
    it('should pass search query to useResources when length >= 2', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      renderHook(() => useResourceSearch('conf'))

      expect(mockedUseGetResourcesQuery).toHaveBeenCalledWith(expect.objectContaining({
        search: 'conf',
      }))
    })

    it('should not search for queries shorter than 2 chars', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      renderHook(() => useResourceSearch('c'))

      expect(mockedUseGetResourcesQuery).toHaveBeenCalledWith(expect.objectContaining({
        search: undefined,
      }))
    })

    it('should merge additional options', () => {
      mockedUseGetResourcesQuery.mockReturnValue(mockQueryResult() as any)

      renderHook(() => useResourceSearch('conf', { resourceType: 'room', limit: 25 }))

      expect(mockedUseGetResourcesQuery).toHaveBeenCalledWith(expect.objectContaining({
        search: 'conf',
        resource_type: 'room',
        limit: 25,
      }))
    })
  })
})
