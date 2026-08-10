/**
 * Resource Components Barrel Export
 * 
 * Exports all resource-related UI components
 */

export { default as QuickBookingModal } from './quick-booking-modal'
export { default as ResourceSelector } from './resource-selector'
export {
  default as ResourceEventIndicator,
  hasResourceAttendees,
  getResourceCount,
  getResourceTypes,
  useEventHasResources,
  useEventResources,
} from './resource-event-indicator'
