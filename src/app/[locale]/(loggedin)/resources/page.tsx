"use client"

/**
 * Resource Browser Page
 * 
 * Allows users to browse, search, and book available resources
 * (meeting rooms, equipment, vehicles, etc.)
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  useGetResourcesQuery,
  useGetAvailableResourcesQuery,
  useCheckResourceAvailabilityMutation,
  useBookResourceMutation,
  useGetMyBookingsQuery,
} from '@/features/resources/store/resources-api'
import { QuickBookingModal } from '@/features/resources/components'
import type {
  Resource,
  ResourceType,
} from '@/features/resources/types/resources'

// ============================================================================
// Constants
// ============================================================================

const RESOURCE_TYPES: ResourceType[] = ['room', 'equipment', 'vehicle', 'other']

// ============================================================================
// Helper Functions
// ============================================================================

function formatResourceType(type: ResourceType): string {
  const typeLabels: Record<ResourceType, string> = {
    room: 'Rooms',
    equipment: 'Equipment',
    vehicle: 'Vehicles',
    other: 'Other',
  }
  return typeLabels[type] || type
}

function formatCapacity(capacity: number | null): string {
  if (capacity === null) return ''
  return capacity === 1 ? `${capacity} person` : `${capacity} people`
}

function formatLocation(location: string | null): string {
  return location || 'Not specified'
}

function formatFeatures(features: string[] | null): string {
  if (!features || features.length === 0) return ''
  return features.join(', ')
}

// ============================================================================
// Filter Types
// ============================================================================

interface ResourceFilters {
  search: string
  resourceType: ResourceType | 'all'
  location: string
  capacityMin: number | ''
  capacityMax: number | ''
  feature: string
  showOnlyAvailable: boolean
}

// ============================================================================
// Sort Types
// ============================================================================

type SortBy = 'name' | 'location' | 'capacity' | 'type'
type SortDirection = 'asc' | 'desc'

// ============================================================================
// Main Component
// ============================================================================

export default function ResourceBrowserPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ==========================================================================
  // State
  // ==========================================================================

  // Filter state
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    resourceType: 'all',
    location: '',
    capacityMin: '',
    capacityMax: '',
    feature: '',
    showOnlyAvailable: false,
  })

  // Sort state
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Modal state
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [bookingTimeRange, setBookingTimeRange] = useState<{ start_time: string; end_time: string } | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showQuickBookingModal, setShowQuickBookingModal] = useState(false)

  // Debounced filter values for API calls
  const [debouncedFilters, setDebouncedFilters] = useState<ResourceFilters>(filters)

  // Debounce filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500)
    return () => clearTimeout(timer)
  }, [filters])

  // ==========================================================================
  // API Hooks
  // ==========================================================================

  const {
    data: resourcesData,
    isLoading: isLoadingResources,
    isError: isErrorResources,
    refetch: refetchResources,
  } = useGetResourcesQuery({
    resource_type: debouncedFilters.resourceType === 'all' ? undefined : debouncedFilters.resourceType,
    location: debouncedFilters.location || undefined,
    capacity_min: debouncedFilters.capacityMin ? Number(debouncedFilters.capacityMin) : undefined,
    capacity_max: debouncedFilters.capacityMax ? Number(debouncedFilters.capacityMax) : undefined,
    search: debouncedFilters.search || undefined,
    feature: debouncedFilters.feature || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  })

  const { data: bookingsData } = useGetMyBookingsQuery()
  const [checkAvailability] = useCheckResourceAvailabilityMutation()
  const [bookResource, { isLoading: isBooking }] = useBookResourceMutation()

  // ==========================================================================
  // Derived Data
  // ==========================================================================

  const resources = useMemo(() => resourcesData?.resources ?? [], [resourcesData])
  const totalCount = useMemo(() => resourcesData?.total_count ?? 0, [resourcesData])
  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize) || 1, [totalCount, pageSize])
  const userBookings = useMemo(() => bookingsData?.bookings ?? [], [bookingsData])

  const resourceBookingCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    userBookings.forEach(booking => {
      counts[booking.resource_id] = (counts[booking.resource_id] || 0) + 1
    })
    return counts
  }, [userBookings])

  // ==========================================================================
  // Sorting Logic
  // ==========================================================================

  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name': comparison = a.name.localeCompare(b.name); break
        case 'location': comparison = (a.location || '').localeCompare(b.location || ''); break
        case 'capacity': comparison = (a.capacity || 0) - (b.capacity || 0); break
        case 'type': comparison = a.resource_type.localeCompare(b.resource_type); break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [resources, sortBy, sortDirection])

  // ==========================================================================
  // Filter Change Handlers
  // ==========================================================================

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPage(1)
  }

  const handleResourceTypeChange = (value: ResourceType | 'all') => {
    setFilters(prev => ({ ...prev, resourceType: value }))
    setPage(1)
  }

  const handleLocationChange = (value: string) => {
    setFilters(prev => ({ ...prev, location: value }))
    setPage(1)
  }

  const handleCapacityMinChange = (value: string) => {
    setFilters(prev => ({ ...prev, capacityMin: value as number | '' }))
    setPage(1)
  }

  const handleCapacityMaxChange = (value: string) => {
    setFilters(prev => ({ ...prev, capacityMax: value as number | '' }))
    setPage(1)
  }

  const handleFeatureChange = (value: string) => {
    setFilters(prev => ({ ...prev, feature: value }))
    setPage(1)
  }

  const handleShowOnlyAvailableChange = (value: boolean) => {
    setFilters(prev => ({ ...prev, showOnlyAvailable: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      resourceType: 'all',
      location: '',
      capacityMin: '',
      capacityMax: '',
      feature: '',
      showOnlyAvailable: false,
    })
    setPage(1)
  }

  // ==========================================================================
  // Sort Handlers
  // ==========================================================================

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(newSortBy)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortBy): string => {
    if (sortBy !== field) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  // ==========================================================================
  // Pagination Handlers
  // ==========================================================================

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  // ==========================================================================
  // Resource Actions
  // ==========================================================================

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource)
    setShowDetailsModal(true)
  }

  const handleQuickBookClick = (resource: Resource) => {
    setSelectedResource(resource)
    setShowQuickBookingModal(true)
  }

  const handleCloseQuickBookingModal = () => {
    setShowQuickBookingModal(false)
    setSelectedResource(null)
  }

  const handleCancelModals = () => {
    setShowBookingModal(false)
    setShowDetailsModal(false)
    setSelectedResource(null)
    setBookingTimeRange(null)
  }

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderSortableHeader = (field: SortBy, label: string) => (
    <th onClick={() => handleSortChange(field)} className="cursor-pointer select-none px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-50">
      <div className="flex items-center gap-1">
        {label}
        <span className="text-xs">{getSortIcon(field)}</span>
      </div>
    </th>
  )

  const renderResourceRow = (resource: Resource) => {
    const bookingCount = resourceBookingCounts[resource.id] || 0
    const isBookedByUser = bookingCount > 0

    return (
      <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <button onClick={() => handleResourceClick(resource)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
              {resource.name}
            </button>
            {isBookedByUser && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full" title={`${bookingCount} booking${bookingCount === 1 ? '' : 's'}`}>
                {bookingCount}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs rounded-full ${
            resource.resource_type === 'room' ? 'bg-blue-100 text-blue-800' :
            resource.resource_type === 'equipment' ? 'bg-orange-100 text-orange-800' :
            resource.resource_type === 'vehicle' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {formatResourceType(resource.resource_type)}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatLocation(resource.location)}</td>
        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatCapacity(resource.capacity)}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="max-w-xs truncate" title={formatFeatures(resource.features)}>
            {formatFeatures(resource.features)}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          {resource.is_active ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Unavailable</span>
          )}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button onClick={() => handleResourceClick(resource)} className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100" title="View details">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button onClick={() => handleQuickBookClick(resource)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Quick book">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    )
  }

  // Resource Details Modal
  const ResourceDetailsModal = () => {
    if (!selectedResource) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCancelModals} />
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{selectedResource.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{formatResourceType(selectedResource.resource_type)}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-600">{selectedResource.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-600">{formatLocation(selectedResource.location)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <p className="mt-1 text-sm text-gray-600">{formatCapacity(selectedResource.capacity) || 'N/A'}</p>
                </div>
              </div>
              {selectedResource.features && selectedResource.features.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedResource.features.map(feature => (
                      <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{feature}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Booking Policy</label>
                <p className="mt-1 text-sm text-gray-600 capitalize">{selectedResource.booking_policy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  selectedResource.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedResource.is_active ? 'Available for booking' : 'Not available'}
                </span>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-end gap-3">
              <button onClick={handleCancelModals} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">
                Close
              </button>
              <button onClick={() => router.push(`/resources/${selectedResource.id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                View Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-500 mt-1">Browse and book meeting rooms, equipment, and vehicles</p>
          </div>
          <button
            onClick={() => router.push('/admin_panel/resources')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium transition-colors"
          >
            Manage Resources
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text" placeholder="Room name, description..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.search} onChange={(e) => handleSearchChange(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.resourceType} onChange={(e) => handleResourceTypeChange(e.target.value as ResourceType | 'all')}
              >
                <option value="all">All Types</option>
                {RESOURCE_TYPES.map(type => <option key={type} value={type}>{formatResourceType(type)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text" placeholder="Building, floor..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.location} onChange={(e) => handleLocationChange(e.target.value)} />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={filters.capacityMin} onChange={(e) => handleCapacityMinChange(e.target.value)} min="1" />
                <span className="self-center px-2 text-gray-500">to</span>
                <input
                  type="number" placeholder="Max"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={filters.capacityMax} onChange={(e) => handleCapacityMaxChange(e.target.value)} min="1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
              <input
                type="text" placeholder="projector, whiteboard..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.feature} onChange={(e) => handleFeatureChange(e.target.value)} />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
              <div className="flex items-center h-10">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={filters.showOnlyAvailable} onChange={(e) => handleShowOnlyAvailableChange(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative" />
                  <span className="ml-3 text-sm font-medium text-gray-700">Only available</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={clearFilters} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">
              Clear Filters
            </button>
            <span className="text-sm text-gray-500">{totalCount} resources found</span>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderSortableHeader('name', 'Name')}
                {renderSortableHeader('type', 'Type')}
                {renderSortableHeader('location', 'Location')}
                {renderSortableHeader('capacity', 'Capacity')}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Features</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingResources ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span>Loading resources...</span>
                  </div>
                </td></tr>
              ) : isErrorResources ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-red-500">Failed to load resources. Please refresh.</td></tr>
              ) : sortedResources.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No resources found</td></tr>
              ) : (
                sortedResources.map(renderResourceRow)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
            <select value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))} className="p-2 border border-gray-300 rounded-md">
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        )}
      </div>
      {/* Modals */}
      {showDetailsModal && <ResourceDetailsModal />}
      {showQuickBookingModal && selectedResource && (
        <QuickBookingModal
          resource={selectedResource}
          isOpen={showQuickBookingModal}
          onClose={handleCloseQuickBookingModal}
        />
      )}
    </div>
  )
}
