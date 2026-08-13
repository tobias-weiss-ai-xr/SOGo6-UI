/**
 * Resource Hooks for Calendar Integration
 * 
 * Provides hooks for accessing resource data in calendar contexts
 */

import {
  useGetResourcesQuery,
  useCheckResourceAvailabilityMutation,
  useGetAvailableResourcesQuery,
} from '@/features/resources/store/resources-api'
import type { Resource, ResourceType } from '@/features/resources/types/resources'
import { useMemo, useCallback } from 'react'

export interface UseResourcesOptions {
  resourceType?: ResourceType
  search?: string
  location?: string
  capacityMin?: number
  features?: string
  limit?: number
}

export interface AvailableResource extends Resource {
  nextAvailable?: string
}

/**
 * Hook to fetch all resources with filtering
 */
export function useResources(options: UseResourcesOptions = {}) {
  const { resourceType, search, location, capacityMin, features, limit = 100 } = options
  
  const { data, isLoading, isError, error, refetch } = useGetResourcesQuery({
    resource_type: resourceType || undefined,
    search: search || undefined,
    location: location || undefined,
    capacity_min: capacityMin || undefined,
    feature: features || undefined,
    limit,
    offset: 0,
  })

  // Filter out inactive resources
  const activeResources = useMemo(() => {
    return data?.resources?.filter(r => r.is_active) || []
  }, [data?.resources])

  return {
    resources: activeResources,
    total: data?.total_count || 0,
    isLoading,
    isError,
    error,
    refetch,
  }
}

/**
 * Hook to fetch available resources for a specific time range
 */
export function useAvailableResources(timeRange: { start: string; end: string }) {
  // The query expects snake_case start_time/end_time — mapping here so the
  // backend actually receives the range (previously undefined → broken
  // availability fetch).
  const { data, isLoading, isError, error, refetch } =
    useGetAvailableResourcesQuery({
      start_time: timeRange.start,
      end_time: timeRange.end,
    })

  return {
    availableResources: data?.resources || [],
    isLoading,
    isError,
    error,
    refetch,
  }
}

/**
 * Hook to check real-time availability of a single resource
 */
export function useResourceAvailability() {
  const [checkAvailability] = useCheckResourceAvailabilityMutation()

  const check = useCallback(async (params: {
    resourceId: string
    start: string
    end: string
    excludeBookingId?: string
  }) => {
    try {
      const result = await checkAvailability({
        resourceId: params.resourceId,
        start_time: params.start,
        end_time: params.end,
        ...(params.excludeBookingId
          ? { exclude_booking_id: params.excludeBookingId }
          : {}),
      }).unwrap()
      return { available: result.available, conflicts: result.conflicts }
    } catch {
      return { available: false, conflicts: [] }
    }
  }, [checkAvailability])

  return { checkAvailability: check }
}

/**
 * Hook to get resources by type
 */
export function useResourcesByType(type: ResourceType) {
  return useResources({ resourceType: type })
}

/**
 * Hook to get all bookable resources (rooms, equipment, vehicles)
 */
export function useBookableResources() {
  const { resources, ...rest } = useResources({})

  const bookable = useMemo(() => {
    return resources.filter(r => 
      r.is_active && 
      (r.resource_type === 'room' || r.resource_type === 'equipment' || r.resource_type === 'vehicle')
    )
  }, [resources])

  return { resources: bookable, ...rest }
}

/**
 * Hook to get resources matching search query with debouncing
 */
export function useResourceSearch(query: string, options: Omit<UseResourcesOptions, 'search'> = {}) {
  const debouncedQuery = query.length >= 2 ? query : ''
  return useResources({ ...options, search: debouncedQuery || undefined })
}
