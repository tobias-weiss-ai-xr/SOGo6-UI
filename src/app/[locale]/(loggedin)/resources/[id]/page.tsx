"use client"

/**
 * Resource Detail Page
 * 
 * Shows detailed information about a specific resource and allows booking
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useGetResourceQuery, useCheckResourceAvailabilityMutation, useBookResourceMutation } from '@/features/resources/store/resources-api'
import type { Resource, TimeRange } from '@/features/resources/types/resources'

// Helper functions
function formatResourceType(type: 'room' | 'equipment' | 'vehicle' | 'other'): string {
  const types: Record<string, string> = { room: 'Room', equipment: 'Equipment', vehicle: 'Vehicle', other: 'Other' }
  return types[type] || type
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString()
}

function formatDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 60) return `${diffMins} minutes`
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
}

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start_time: new Date(Date.now() + 15 * 60000).toISOString(),
    end_time: new Date(Date.now() + 75 * 60000).toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const [bookingData, setBookingData] = useState({ title: '', description: '', location: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // API hooks
  const { data: resource, isLoading, isError, refetch } = useGetResourceQuery(params.id)
  const [checkAvailability] = useCheckResourceAvailabilityMutation()
  const [bookResource] = useBookResourceMutation()

  // Redirect if resource not found
  useEffect(() => {
    if (!isLoading && isError) {
      router.push('/resources')
    }
  }, [isLoading, isError, router])

  const handleCheckAvailability = async () => {
    if (!resource) return
    try {
      const result = await checkAvailability({ resourceId: resource.id, ...timeRange }).unwrap()
      if (!result.available) {
        alert(`Resource not available during ${formatDateTime(timeRange.start_time)} - ${formatDateTime(timeRange.end_time)}`)
      } else {
        alert('Resource is available! Ready to book.')
      }
    } catch (error) {
      alert('Failed to check availability')
    }
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resource) return
    setIsSubmitting(true)
    try {
      const result = await bookResource({ resourceId: resource.id, ...timeRange, ...bookingData }).unwrap()
      setSuccessMessage(result.message)
      setBookingData({ title: '', description: '', location: '' })
      // Reset time range to default
      setTimeRange({
        start_time: new Date(Date.now() + 15 * 60000).toISOString(),
        end_time: new Date(Date.now() + 75 * 60000).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setTimeout(() => router.push('/resources'), 2000)
    } catch (error) {
      alert('Failed to book resource')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="text-xl font-medium text-gray-700">Loading resource...</span>
      </div>
    </div>
  )

  if (!resource) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Resource Not Found</h1>
        <button onClick={() => router.push('/resources')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Back to Resources
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/resources')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{resource.name}</h1>
            <p className="text-gray-500">{formatResourceType(resource.resource_type)}</p>
          </div>
        </div>

        {/* Resource Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resource Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-600">{resource.location || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <p className="text-gray-600">{resource.capacity ? `${resource.capacity} people` : 'Not specified'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-600">{resource.description || 'No description provided'}</p>
            </div>
            {resource.features && resource.features.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <div className="flex flex-wrap gap-2">
                  {resource.features.map(feature => (
                    <span key={feature} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-600">{resource.email || 'Not specified'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Policy</label>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  resource.booking_policy === 'open' ? 'bg-green-100 text-green-800' :
                  resource.booking_policy === 'moderated' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {resource.booking_policy}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Accept</label>
                <p className="text-gray-600">{resource.auto_accept ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                resource.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {resource.is_active ? 'Available for booking' : 'Not available'}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Book This Resource</h2>
          
          {successMessage ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-green-800">{successMessage}</p>
              <p className="text-green-600 mt-1">Redirecting to resources list...</p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={timeRange.start_time.replace('Z', '').slice(0, 16)}
                      onChange={(e) => setTimeRange(prev => ({ ...prev, start_time: new Date(e.target.value).toISOString() }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={timeRange.end_time.replace('Z', '').slice(0, 16)}
                      onChange={(e) => setTimeRange(prev => ({ ...prev, end_time: new Date(e.target.value).toISOString() }))}
                      min={timeRange.start_time.replace('Z', '').slice(0, 16)}
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Duration: {formatDuration(timeRange.start_time, timeRange.end_time)}</p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text" id="title" placeholder={`Meeting in ${resource.name}`}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={bookingData.title} onChange={(e) => setBookingData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description" rows={3} placeholder="Optional description of your meeting/event"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={bookingData.description} onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text" id="location" placeholder={resource.location || 'Optional custom location'}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={bookingData.location} onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  Check Availability
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {isSubmitting ? 'Booking...' : 'Book Resource'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
