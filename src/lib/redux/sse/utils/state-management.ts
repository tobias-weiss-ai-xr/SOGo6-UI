/**
 * SSE State Management Utilities
 * Helper functions for managing connection state and timeouts
 */

import { SSEConnectionState } from '../types'
import { logger } from '@/lib/logger'

export interface StateChangeHandler {
  (_state: SSEConnectionState): void
}

export interface ErrorHandler {
  (_error: Error): void
}

/**
 * Notify state change subscribers
 */
export function notifyStateChange(
  handlers: Set<StateChangeHandler>,
  state: SSEConnectionState
): void {
  handlers.forEach((handler) => {
    try {
      handler(state)
    } catch (error) {
      logger.error('Error in state change handler:', { error: error })
    }
  })
}

/**
 * Notify error subscribers
 */
export function notifyError(handlers: Set<ErrorHandler>, error: Error): void {
  handlers.forEach((handler) => {
    try {
      handler(error)
    } catch (err) {
      logger.error('Error in error handler:', { error: err })
    }
  })
}

/**
 * Create error message for connection errors
 */
export function createConnectionError(event: Event): Error {
  return new Error(`SSE Connection error: ${event.type || 'Unknown error'}`)
}

/**
 * Calculate reconnection delay with exponential backoff
 */
export function calculateReconnectionDelay(
  reconnectAttempts: number,
  baseInterval: number
): number {
  return baseInterval * reconnectAttempts
}

/**
 * Check if should attempt reconnection
 */
export function shouldAttemptReconnection(
  currentAttempts: number,
  maxAttempts: number
): boolean {
  return currentAttempts < maxAttempts
}
