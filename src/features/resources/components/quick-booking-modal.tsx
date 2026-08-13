"use client"

/**
 * QuickBookingModal Component
 * 
 * Provides a modal dialog for quick resource booking from the browser page
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import type { Resource, BookResourceRequest, TimeRange } from '@/features/resources/types/resources'
import { useCheckResourceAvailabilityMutation, useBookResourceMutation } from '@/features/resources/store/resources-api'

interface QuickBookingModalProps {
  resource: Resource
  isOpen: boolean
  onClose: () => void
  initialDate?: string
}

// Helper to format date for input
function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 16)
}

// Helper to get default date range
function getDefaultDateRange(initialDate?: string): { start: string; end: string } {
  const now = new Date()
  if (initialDate) {
    const startDate = new Date(initialDate)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 hour
    return {
      start: formatDateForInput(startDate),
      end: formatDateForInput(endDate),
    }
  }
  
  // Default: today at current time for 1 hour
  const start = now
  const end = new Date(now.getTime() + 60 * 60 * 1000)
  return {
    start: formatDateForInput(start),
    end: formatDateForInput(end),
  }
}

/**
 * Converts datetime-local string to ISO string
 */
function dateTimeLocalToISO(dateTimeLocal: string): string {
  // datetime-local format: YYYY-MM-DDTHH:MM
  // We need to add the timezone information
  const date = new Date(dateTimeLocal)
  return date.toISOString()
}

export default function QuickBookingModal({ resource, isOpen, onClose, initialDate }: QuickBookingModalProps) {
  const t = useTranslations('resources')
  const router = useRouter()
  
  // API hooks
  const [checkAvailability, { isLoading: isChecking }] = useCheckResourceAvailabilityMutation()
  const [bookResource, { isLoading: isBooking }] = useBookResourceMutation()
  
  // State
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isOnlineMeeting, setIsOnlineMeeting] = useState<boolean>(false)
  const [onlineMeetingLink, setOnlineMeetingLink] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  
  // Validation and status
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [bookingData, setBookingData] = useState<Record<string, any> | null>(null)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  
  // Initialize with default date range
  useEffect(() => {
    if (isOpen) {
      const { start, end } = getDefaultDateRange(initialDate)
      setStartTime(start)
      setEndTime(end)
      setTitle(`Meeting in ${resource.name}`)
      setLocation(resource.location || '')
      setIsAvailable(null)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, resource.name, resource.location, initialDate])
  
  // Check availability when times change
  useEffect(() => {
    if (startTime && endTime && isOpen) {
      const debounceTimer = setTimeout(() => {
        checkAvailabilityForBooking()
      }, 500)
      return () => clearTimeout(debounceTimer)
    }
  }, [startTime, endTime, isOpen, resource.id])
  
  const checkAvailabilityForBooking = useCallback(async () => {
    if (!startTime || !endTime) return
    
    try {
      const response = await checkAvailability({
        resourceId: resource.id,
        start_time: dateTimeLocalToISO(startTime),
        end_time: dateTimeLocalToISO(endTime),
      }).unwrap()
      
      setIsAvailable(response.available)
      if (!response.available && response.conflicts?.length > 0) {
        setError('Resource is not available during the selected time')
      } else {
        setError(null)
      }
    } catch (err: any) {
      setIsAvailable(false)
      setError(err.data?.message || 'Failed to check availability')
    }
  }, [startTime, endTime, resource.id, checkAvailability])
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!startTime || !endTime) {
      setError('Please select a valid time range')
      return
    }
    
    if (!title) {
      setError('Please enter a title')
      return
    }
    
    if (isAvailable === false) {
      setError('Resource is not available during the selected time')
      return
    }
    
    setError(null)
    // NOTE: there is no local setIsBooking state — the mutation hook's
    // isBooking flag tracks the in-flight request; the phantom setter calls
    // were a ReferenceError on every booking attempt.
    
    const bookingRequest: BookResourceRequest = {
      start_time: dateTimeLocalToISO(startTime),
      end_time: dateTimeLocalToISO(endTime),
      title,
      description: description || undefined,
      location: location || undefined,
      is_online_meeting: isOnlineMeeting,
      online_meeting_link: isOnlineMeeting ? onlineMeetingLink : undefined,
    }
    
    try {
      const response = await bookResource({
        resourceId: resource.id,
        ...bookingRequest,
      }).unwrap()
      
      setSuccess(true)
      setBookingData(response)
      
      // Auto-close after 3 seconds and redirect to bookings or resource detail
      setTimeout(() => {
        onClose()
        // Optionally redirect to resource detail or bookings page
        // router.push(`/resources/${resource.id}`)
      }, 3000)
    } catch (err: any) {
      setError(err.data?.message || 'Failed to book resource')
    }
  }, [startTime, endTime, title, description, location, isOnlineMeeting, onlineMeetingLink, isAvailable, resource.id, bookResource, onClose])
  
  const handleClose = useCallback(() => {
    setError(null)
    setSuccess(false)
    setIsAvailable(null)
    onClose()
  }, [onClose])
  
  const setStartTimeWithValidation = useCallback((value: string) => {
    setStartTime(value)
    // Ensure end time is after start time
    if (endTime && new Date(value) >= new Date(endTime)) {
      const newEnd = new Date(value)
      newEnd.setHours(newEnd.getHours() + 1)
      setEndTime(formatDateForInput(newEnd))
    }
  }, [endTime])
  
  const setEndTimeWithValidation = useCallback((value: string) => {
    setEndTime(value)
    // Ensure end time is after start time
    if (startTime && new Date(value) <= new Date(startTime)) {
      const newStart = new Date(value)
      newStart.setHours(newStart.getHours() - 1)
      setStartTime(formatDateForInput(newStart))
    }
  }, [startTime])
  
  // Calculate duration for display
  const calculateDuration = useCallback(() => {
    if (!startTime || !endTime) return null
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    } else {
      const days = Math.floor(diffMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''}`
    }
  }, [startTime, endTime])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleClose} />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {success ? (
            // Success view
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-500 mb-4">
                Your booking for <span className="font-medium text-gray-900">{resource.name}</span> has been created.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-1">Booking ID: {bookingData?.booking_id?.slice(0, 8)}...</p>
                <p className="text-sm text-gray-600 mb-1">Title: {title}</p>
                <p className="text-sm text-gray-600 mb-1">Start: {startTime}</p>
                <p className="text-sm text-gray-600">End: {endTime}</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Booking form
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Quick Book: {resource.name}
                </h3>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Resource info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    resource.resource_type === 'room' ? 'bg-blue-500' :
                    resource.resource_type === 'equipment' ? 'bg-orange-500' :
                    resource.resource_type === 'vehicle' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}>
                    {resource.resource_type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{resource.name}</h4>
                    <p className="text-sm text-gray-500">{resource.capacity ? `Capacity: ${resource.capacity}` : resource.location}</p>
                  </div>
                </div>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {/* Availability status */}
              {isAvailable !== null && (
                <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  isAvailable ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <svg className={`w-5 h-5 ${isAvailable ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isAvailable ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  {isAvailable ? 'Available during selected time' : 'Not available - please choose a different time'}
                </div>
              )}
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text" id="title" required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Meeting in Conference Room A"
                  />
                </div>
                
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
                      Start *
                    </label>
                    <input
                      type="datetime-local" id="start" required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={startTime} onChange={(e) => setStartTimeWithValidation(e.target.value)}
                      min={formatDateForInput(new Date())}
                    />
                  </div>
                  <div>
                    <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
                      End *
                    </label>
                    <input
                      type="datetime-local" id="end" required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={endTime} onChange={(e) => setEndTimeWithValidation(e.target.value)}
                      min={startTime}
                    />
                  </div>
                </div>
                
                {/* Duration display */}
                <div className="text-sm text-gray-500">
                  Duration: {calculateDuration() || 'Select a time range'}
                </div>
                
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text" id="location"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder={resource.location || 'e.g., Building A, Floor 1'}
                  />
                </div>
                
                {/* Online meeting toggle */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" id="is_online"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={isOnlineMeeting} onChange={(e) => setIsOnlineMeeting(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">Online Meeting</span>
                  </label>
                </div>
                
                {/* Online meeting link */}
                {isOnlineMeeting && (
                  <div>
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="url" id="link"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={onlineMeetingLink} onChange={(e) => setOnlineMeetingLink(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                )}
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description" rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description of the meeting"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button" onClick={handleClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                    disabled={isChecking || isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isChecking || isBooking || !isAvailable}
                  >
                    {isBooking ? 'Booking...' : isChecking ? 'Checking...' : 'Book Now'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
