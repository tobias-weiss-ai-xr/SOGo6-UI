/**
 * Unit tests for ResourceEventIndicator component and utilities
 * Resource Booking Feature - Tier 0 Foundation
 */

import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import ResourceEventIndicator, {
  hasResourceAttendees,
  getResourceCount,
  getResourceTypes,
  useEventHasResources,
  useEventResources,
} from '../components/resource-event-indicator'

// Mock CalendarEvent data
const mockEventWithResources: any = {
  id: 'event-001',
  title: 'Team Meeting',
  start: new Date('2025-01-15T10:00:00Z'),
  end: new Date('2025-01-15T11:00:00Z'),
  attendees: [
    { uri: 'mailto:user1@example.org', cutype: 'individual', role: 'REQ-PARTICIPANT' },
    { uri: 'mailto:room-a@example.org', cutype: 'room', role: 'RESOURCE' },
    { uri: 'mailto:projector@example.org', cutype: 'resource', role: 'RESOURCE' },
  ],
}

const mockEventWithoutResources: any = {
  id: 'event-002',
  title: 'Simple Meeting',
  start: new Date('2025-01-15T10:00:00Z'),
  end: new Date('2025-01-15T11:00:00Z'),
  attendees: [
    { uri: 'mailto:user1@example.org', cutype: 'individual' },
    { uri: 'mailto:user2@example.org', cutype: 'individual' },
  ],
}

const mockEventWithEmptyAttendees: any = {
  id: 'event-003',
  title: 'Solo Event',
  start: new Date('2025-01-15T10:00:00Z'),
  end: new Date('2025-01-15T11:00:00Z'),
  attendees: [],
}

describe('ResourceEventIndicator Utilities', () => {
  // ==========================================================================
  // hasResourceAttendees
  // ==========================================================================

  describe('hasResourceAttendees', () => {
    it('should return true for events with resource/room attendees', () => {
      expect(hasResourceAttendees(mockEventWithResources)).toBe(true)
    })

    it('should return false for events without resource attendees', () => {
      expect(hasResourceAttendees(mockEventWithoutResources)).toBe(false)
    })

    it('should return false for events with empty attendees', () => {
      expect(hasResourceAttendees(mockEventWithEmptyAttendees)).toBe(false)
    })

    it('should handle missing attendees field', () => {
      const event = { id: 'x', attendees: undefined } as any
      expect(hasResourceAttendees(event)).toBe(false)
    })

    it('should handle null attendees', () => {
      const event = { id: 'x', attendees: null } as any
      expect(hasResourceAttendees(event)).toBe(false)
    })

    it('should ignore individual attendees', () => {
      const event = {
        attendees: [
          { uri: 'mailto:u@example.org', cutype: 'individual' },
        ],
      } as any
      expect(hasResourceAttendees(event)).toBe(false)
    })

    it('should handle missing cutype field', () => {
      const event = { attendees: [{ uri: 'mailto:u@example.org' }] } as any
      expect(hasResourceAttendees(event)).toBe(false)
    })
  })

  // ==========================================================================
  // getResourceCount
  // ==========================================================================

  describe('getResourceCount', () => {
    it('should return the number of resource attendees', () => {
      expect(getResourceCount(mockEventWithResources)).toBe(2)
    })

    it('should return 0 for events without resource attendees', () => {
      expect(getResourceCount(mockEventWithoutResources)).toBe(0)
    })

    it('should return 0 for empty attendees', () => {
      expect(getResourceCount(mockEventWithEmptyAttendees)).toBe(0)
    })

    it('should count only room and resource cutypes', () => {
      const event = {
        attendees: [
          { cutype: 'individual' },
          { cutype: 'room' },
          { cutype: 'resource' },
          { cutype: 'individual' },
        ],
      } as any
      expect(getResourceCount(event)).toBe(2)
    })
  })

  // ==========================================================================
  // getResourceTypes
  // ==========================================================================

  describe('getResourceTypes', () => {
    it('should map room cutype to room type', () => {
      const types = getResourceTypes(mockEventWithResources)
      expect(types.has('room')).toBe(true)
    })

    it('should map resource cutype to equipment type', () => {
      const types = getResourceTypes(mockEventWithResources)
      expect(types.has('equipment')).toBe(true)
    })

    it('should return empty set for non-resource events', () => {
      const types = getResourceTypes(mockEventWithoutResources)
      expect(types.size).toBe(0)
    })

    it('should deduplicate resource types', () => {
      const event = {
        attendees: [
          { cutype: 'room' },
          { cutype: 'room' },
          { cutype: 'resource' },
        ],
      } as any
      const types = getResourceTypes(event)
      expect(types.size).toBe(2)
      expect(types.has('room')).toBe(true)
      expect(types.has('equipment')).toBe(true)
    })

    it('should handle missing attendees', () => {
      expect(getResourceTypes({} as any).size).toBe(0)
    })
  })

  // ==========================================================================
  // useEventHasResources hook
  // ==========================================================================

  describe('useEventHasResources', () => {
    it('should return true when event has resources', () => {
      const { result } = renderHook(() => useEventHasResources(mockEventWithResources))
      expect(result.current).toBe(true)
    })

    it('should return false when event has no resources', () => {
      const { result } = renderHook(() => useEventHasResources(mockEventWithoutResources))
      expect(result.current).toBe(false)
    })
  })

  // ==========================================================================
  // useEventResources hook
  // ==========================================================================

  describe('useEventResources', () => {
    it('should return resource info for event with resources', () => {
      const { result } = renderHook(() => useEventResources(mockEventWithResources))
      expect(result.current.hasResources).toBe(true)
      expect(result.current.count).toBe(2)
      expect(result.current.types.has('room')).toBe(true)
      expect(result.current.types.has('equipment')).toBe(true)
    })

    it('should return empty info for event without resources', () => {
      const { result } = renderHook(() => useEventResources(mockEventWithoutResources))
      expect(result.current.hasResources).toBe(false)
      expect(result.current.count).toBe(0)
      expect(result.current.types.size).toBe(0)
    })
  })

  // ==========================================================================
  // ResourceEventIndicator component rendering
  // ==========================================================================

  describe('ResourceEventIndicator Rendering', () => {
    it('should render null when event has no resources', () => {
      const { container } = render(<ResourceEventIndicator event={mockEventWithoutResources} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render null when event has empty attendees', () => {
      const { container } = render(<ResourceEventIndicator event={mockEventWithEmptyAttendees} />)
      expect(container.firstChild).toBeNull()
    })

    it('should render an indicator when event has resources', () => {
      const { container } = render(<ResourceEventIndicator event={mockEventWithResources} />)
      expect(container.firstChild).not.toBeNull()
    })

    it('should show count when multiple resource attendees', () => {
      render(<ResourceEventIndicator event={mockEventWithResources} />)
      // With multiple types it renders a Badge with count
      const badge = screen.queryByTitle(/resources booked/i)
      expect(badge).not.toBeNull()
    })

    it('should render single-type indicator with icon and count', () => {
      const event = {
        attendees: [
          { cutype: 'room' },
          { cutype: 'room' },
        ],
      } as any
      render(<ResourceEventIndicator event={event} />)
      const indicator = screen.queryByTitle('2 rooms booked')
      expect(indicator).not.toBeNull()
    })

    it('should render single-type indicator with count of 1', () => {
      const event = {
        attendees: [{ cutype: 'resource' }],
      } as any
      render(<ResourceEventIndicator event={event} />)
      const indicator = screen.queryByTitle('1 equipment booked')
      expect(indicator).not.toBeNull()
    })

    it('should support custom className', () => {
      const { container } = render(
        <ResourceEventIndicator event={mockEventWithResources} className="custom-class" />
      )
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('custom-class')
    })
  })
})
