'use client'

/**
 * LiveAnnouncer Component
 *
 * Provides live region announcements for screen readers.
 * Used to announce dynamic content changes, loading states, and other
 * important information to assistive technology users.
 *
 * WCAG 2.1: 4.1.3 Status Messages (Level AA)
 */

import { ARIA_LIVE_REGIONS } from '@/lib/accessibility/constants'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

export type PolitenessLevel = keyof typeof ARIA_LIVE_REGIONS

export interface Announcement {
  message: string
  politeness: PolitenessLevel
  delay?: number
}

export interface LiveAnnouncerContextType {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, politeness?: PolitenessLevel) => void

  /**
   * Announce with a delay
   */
  announceWithDelay: (
    message: string,
    politeness?: PolitenessLevel,
    delay?: number
  ) => void

  /**
   * Clear all pending announcements
   */
  clearAnnouncements: () => void

  /**
   * Current queue of announcements
   */
  queue: Announcement[]
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | null>(
  null
)

/**
 * LiveAnnouncer Provider Component
 *
 * This component should be placed near the root of your application
 * to provide live region announcement functionality to all components.
 */
export interface LiveAnnouncerProviderProps {
  children: ReactNode
  /** Default politeness level */
  defaultPoliteness?: PolitenessLevel
}

export const LiveAnnouncerProvider: React.FC<LiveAnnouncerProviderProps> = ({
  children,
  defaultPoliteness = 'POLITE',
}) => {
  const [queue, setQueue] = useState<Announcement[]>([])
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Announcement | null>(null)

  // Process announcements from the queue
  useEffect(() => {
    if (queue.length > 0) {
      const nextAnnouncement = queue[0]
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentAnnouncement(nextAnnouncement)

      // Remove from queue after announcing
      const timer = setTimeout(() => {
        setQueue((prev) => prev.slice(1))
        setCurrentAnnouncement(null)
      }, nextAnnouncement.delay || 0)

      return () => clearTimeout(timer)
    }
  }, [queue])

  const announce = (
    message: string,
    politeness: PolitenessLevel = defaultPoliteness
  ) => {
    setQueue((prev) => [...prev, { message, politeness }])
  }

  const announceWithDelay = (
    message: string,
    politeness: PolitenessLevel = defaultPoliteness,
    delay: number = 0
  ) => {
    setQueue((prev) => [...prev, { message, politeness, delay }])
  }

  const clearAnnouncements = () => {
    setQueue([])
    setCurrentAnnouncement(null)
  }

  const contextValue: LiveAnnouncerContextType = {
    announce,
    announceWithDelay,
    clearAnnouncements,
    queue,
  }

  return (
    <LiveAnnouncerContext.Provider value={contextValue}>
      {children}

      {/* Visually hidden live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: '0',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: '0',
        }}
      >
        {currentAnnouncement?.politeness === 'POLITE'
          ? currentAnnouncement.message
          : ''}
      </div>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: '0',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: '0',
        }}
      >
        {currentAnnouncement?.politeness === 'ASSERTIVE'
          ? currentAnnouncement.message
          : ''}
      </div>
    </LiveAnnouncerContext.Provider>
  )
}

/**
 * Hook to use the LiveAnnouncer context
 */
export function useLiveAnnouncer(): LiveAnnouncerContextType {
  const context = useContext(LiveAnnouncerContext)

  if (context === null) {
    throw new Error(
      'useLiveAnnouncer must be used within a LiveAnnouncerProvider'
    )
  }

  return context
}

/**
 * Component for announcing messages within a specific scope
 */
export interface AnnounceProps {
  message: string
  politeness?: PolitenessLevel
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
}

export const Announce: React.FC<AnnounceProps> = ({
  message,
  politeness = 'POLITE',
  as: Component = 'div',
  className = '',
  style = {},
  children,
}) => {
  const { announce } = useLiveAnnouncer()
  const [hasAnnounced, setHasAnnounced] = useState(false)

  useEffect(() => {
    if (message && !hasAnnounced) {
      announce(message, politeness)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasAnnounced(true)
    }
  }, [message, politeness, announce, hasAnnounced])

  return (
    <Component
      className={`announce ${className}`}
      style={style}
      aria-live={politeness.toLowerCase()}
      aria-atomic="true"
    >
      {children || message}
    </Component>
  )
}

/**
 * Accessible Loading State Component
 *
 * Announces loading state changes to screen readers
 */
export interface LoadingAnnouncerProps {
  isLoading: boolean
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  hasError?: boolean
  hasSuccess?: boolean
}

export const LoadingAnnouncer: React.FC<LoadingAnnouncerProps> = ({
  isLoading,
  loadingMessage = 'Loading...',
  successMessage = 'Content loaded',
  errorMessage = 'Error loading content',
  hasError,
  hasSuccess,
}) => {
  const { announce } = useLiveAnnouncer()
  const [prevLoading, setPrevLoading] = useState(isLoading)
  const [prevError, setPrevError] = useState(hasError)
  const [prevSuccess, setPrevSuccess] = useState(hasSuccess)

  useEffect(() => {
    if (
      prevLoading !== isLoading ||
      prevError !== hasError ||
      prevSuccess !== hasSuccess
    ) {
      if (isLoading) {
        announce(loadingMessage, 'POLITE')
      } else if (hasError) {
        announce(errorMessage, 'ASSERTIVE')
      } else if (hasSuccess) {
        announce(successMessage, 'POLITE')
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrevLoading(isLoading)

      setPrevError(hasError)

      setPrevSuccess(hasSuccess)
    }
  }, [
    isLoading,
    hasError,
    hasSuccess,
    announce,
    loadingMessage,
    successMessage,
    errorMessage,
  ])

  return null
}

/**
 * NotificationAnnouncer for toast/notification messages
 */
export interface NotificationAnnouncerProps {
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }>
}

export const NotificationAnnouncer: React.FC<NotificationAnnouncerProps> = ({
  notifications,
}) => {
  const { announce } = useLiveAnnouncer()
  const [announcedIds, setAnnouncedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    notifications.forEach((notification) => {
      if (!announcedIds.has(notification.id)) {
        // Announce with appropriate politeness based on type
        const politeness: PolitenessLevel =
          notification.type === 'error' ? 'ASSERTIVE' : 'POLITE'
        announce(notification.message, politeness)
        setAnnouncedIds((prev) => new Set(prev).add(notification.id))
      }
    })

    // Clean up announced IDs when notifications are dismissed
    const currentIds = new Set(notifications.map((n) => n.id))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnnouncedIds((prev) => {
      const newSet = new Set(prev)
      let changed = false
      for (const id of newSet) {
        if (!currentIds.has(id)) {
          newSet.delete(id)
          changed = true
        }
      }
      // Return the same reference when unchanged to avoid an infinite
      // effect loop (announcedIds is in the dependency array).
      return changed ? newSet : prev
    })
  }, [notifications, announce, announcedIds])

  return null
}

/**
 * Route announcement for navigation changes
 */
export interface RouteAnnouncerProps {
  path: string
  title?: string
}

export const RouteAnnouncer: React.FC<RouteAnnouncerProps> = ({
  path,
  title,
}) => {
  const { announce } = useLiveAnnouncer()
  const [prevPath, setPrevPath] = useState(path)

  useEffect(() => {
    if (prevPath !== path) {
      // Don't announce initial page load
      if (prevPath) {
        const message = title ? `Navigated to ${title}` : `Navigated to ${path}`
        announce(message, 'POLITE')
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrevPath(path)
    }
  }, [path, title, announce, prevPath])

  return null
}

/**
 * Simple hook for one-off announcements
 */
export function useAnnounce() {
  const { announce } = useLiveAnnouncer()

  return {
    /**
     * Announce a message
     */
    announce: (message: string, politeness?: PolitenessLevel) => {
      announce(message, politeness)
    },

    /**
     * Announce form submission state
     */
    announceFormState: (
      state: 'loading' | 'success' | 'error',
      formName?: string
    ) => {
      const messages = {
        loading: formName ? `Submitting ${formName}...` : 'Submitting...',
        success: formName
          ? `${formName} submitted successfully`
          : 'Form submitted successfully',
        error: formName
          ? `Error submitting ${formName}`
          : 'Error submitting form',
      }
      const politeness: PolitenessLevel =
        state === 'error' ? 'ASSERTIVE' : 'POLITE'
      announce(messages[state], politeness)
    },

    /**
     * Announce a toast notification
     */
    announceToast: (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info'
    ) => {
      const politeness: PolitenessLevel =
        type === 'error' ? 'ASSERTIVE' : 'POLITE'
      announce(message, politeness)
    },
  }
}

export default LiveAnnouncerProvider
