"use client"

/**
 * Resource Event Indicator Component
 * 
 * Shows visual indicators for events that have resource attendees
 */

import { Badge } from '@/components/ui/badge'
import { MapPin, Monitor, Car } from 'lucide-react'
import type { CalendarEvent } from '@/features/calendars/calendars-types'

/**
 * Props for ResourceEventIndicator component
 */
interface ResourceEventIndicatorProps {
  event: CalendarEvent
  className?: string
}

/**
 * Check if an event has resource attendees
 */
export function hasResourceAttendees(event: CalendarEvent): boolean {
  return event.attendees?.some(a => a.cutype === 'resource' || a.cutype === 'room') ?? false
}

/**
 * Get resource count from event attendees
 */
export function getResourceCount(event: CalendarEvent): number {
  return event.attendees?.filter(a => a.cutype === 'resource' || a.cutype === 'room').length ?? 0
}

/**
 * Get resource types from event attendees
 */
export function getResourceTypes(event: CalendarEvent): Set<'room' | 'equipment' | 'vehicle'> {
  const types = new Set<'room' | 'equipment' | 'vehicle'>()
  
  // Map cutype to our resource types
  event.attendees?.forEach(a => {
    if (a.cutype === 'room') {
      types.add('room')
    } else if (a.cutype === 'resource') {
      // Check if it's a vehicle by looking at the email or name (simplified)
      // In practice, we might need to look up the resource details
      // For now, we'll just show generic resource
      types.add('equipment')
    }
  })
  
  return types
}

/**
 * Resource type to icon mapping
 */
const resourceTypeIconMap: Record<'room' | 'equipment' | 'vehicle', React.ReactNode> = {
  room: <MapPin className="w-3 h-3" />,
  equipment: <Monitor className="w-3 h-3" />,
  vehicle: <Car className="w-3 h-3" />,
}

/**
 * Resource type to label mapping
 */
const resourceTypeLabelMap: Record<'room' | 'equipment' | 'vehicle', string> = {
  room: 'Room',
  equipment: 'Equipment',
  vehicle: 'Vehicle',
}

/**
 * Resource Event Indicator Component
 * 
 * Displays a small badge indicator when an event has resource attendees
 */
export function ResourceEventIndicator({ 
  event, 
  className 
}: ResourceEventIndicatorProps) {
  if (!hasResourceAttendees(event)) {
    return null
  }

  const count = getResourceCount(event)
  const types = getResourceTypes(event)

  // If only one type, show its icon
  if (types.size === 1) {
    const type = Array.from(types)[0]
    return (
      <span 
        className={`inline-flex items-center gap-1 text-xs ${className || ''}`}
        title={`${count} ${type}${count > 1 ? 's' : ''} booked`}
      >
        {resourceTypeIconMap[type]}
        {count > 1 && <span>{count}</span>}
      </span>
    )
  }

  // Multiple types - show count only
  return (
    <Badge 
      variant="secondary" 
      className={`text-xs px-1 py-0.5 ${className || ''}`}
      title={`${count} resources booked: ${Array.from(types).map(t => resourceTypeLabelMap[t]).join(', ')}`}
    >
      {Array.from(types).map(t => resourceTypeIconMap[t])}
      {count}
    </Badge>
  )
}

/**
 * Hook to check if an event has resource attendees
 */
export function useEventHasResources(event: CalendarEvent): boolean {
  return hasResourceAttendees(event)
}

/**
 * Hook to get resource information from an event
 */
export function useEventResources(event: CalendarEvent) {
  return {
    hasResources: hasResourceAttendees(event),
    count: getResourceCount(event),
    types: getResourceTypes(event),
  }
}

export default ResourceEventIndicator
