/**
 * Mail Received Event Listener Hook
 *
 * Hook to listen for mail:received SSE events and update Redux cache.
 * This is separated into its own module to avoid importing client code
 * into the main hooks.ts file.
 */

'use client'

import { useEffect } from 'react'
// This import ensures the mails endpoints are registered
import type { ImapMessagesList } from '@/features/mails/mails-types'
import '@/features/mails/store/mails-api'
import { apiSlice } from '../../api/api-slice'
import { useAppDispatch } from '../../hooks'
import type { AppDispatch, RootState } from '../../store'
import { getSSEServiceInstance } from '../sse-api'
import { logger } from '@/lib/logger'

// Singleton registry: track all active listener registrations
// This prevents duplicate SSE subscriptions while supporting multiple folders
interface ListenerRegistration {
  folder: string
  accountId: string
  params?: Record<string, string | number | boolean>
  fallbacks?: MailReceivedListenerFallbacks
  dispatch: AppDispatch
}

const listenerRegistry: ListenerRegistration[] = []
let activeHandler: ((message: { type: string; data?: Record<string, unknown> }) => void) | null = null
// The single active SSE subscription. Tracked at module level so ANY
// registration's cleanup can tear it down when the registry empties — a
// later mount's cleanup closure would otherwise see `undefined` (only the
// first mount ever subscribes) and silently leak the handler + stream.
let activeUnsubscribe: (() => void) | null = null

export interface MailReceivedListenerFallbacks {
  defaultSubject: string
  defaultSenderName: string
}

/**
 * Hook to listen for mail:received SSE events and update cache
 *
 * @param folder - The folder to update when new mail arrives (defaults to 'INBOX')
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   useMailReceivedListener('INBOX');
 *   // ... rest of component
 * }
 * ```
 */
export function useMailReceivedListener(
  folder: string = 'INBOX',
  params?: Record<string, string | number | boolean>,
  fallbacks?: MailReceivedListenerFallbacks,
  accountId: string = '0'
) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Retry interval for waiting on SSE service
    let retryCount = 0
    const maxRetries = 3 // Wait up to 30 seconds (3 * 10s)
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    // Declared in effect scope so cleanup can always reference it safely
    // (setupListener may not have run/registered yet when cleanup fires)
    let registration: ListenerRegistration | null = null

    const setupListener = () => {
      const sseService = getSSEServiceInstance()

      if (!sseService) {
        retryCount++
        if (retryCount < maxRetries) {
          timeoutId = setTimeout(setupListener, 10000)
        } else {
          logger.warn('SSE service failed to initialize after retries')
        }
        return
      }

      // Add this registration to the registry (only once per mount)
      registration = { folder, accountId, params, fallbacks, dispatch }
      listenerRegistry.push(registration)

      // Singleton pattern: only register ONE handler globally
      if (!activeHandler) {
        activeHandler = (message) => {
          if (message.type === 'mail:received' && message.data) {
            const mailData = message.data as Record<string, unknown>
            // Update cache for ALL registered folders
            for (const reg of listenerRegistry) {
              updateMailsCache(
                reg.dispatch,
                reg.folder,
                reg.params,
                mailData,
                reg.fallbacks,
                reg.accountId
              )
            }
          }
        }
        activeUnsubscribe = sseService.subscribe('mail:received', activeHandler)
      }
    }

    // Start trying to set up listener
    setupListener()

    // Cleanup: remove this registration from the registry
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      // Remove this specific registration (safe even if never registered)
      if (registration && listenerRegistry.includes(registration)) {
        listenerRegistry.splice(listenerRegistry.indexOf(registration), 1)
        registration = null
      }
      // If no more registrations, tear down the shared handler + stream.
      // Uses the module-level activeUnsubscribe so the LAST mount to leave
      // resets the singleton even if it was not the mount that subscribed.
      if (listenerRegistry.length === 0 && activeUnsubscribe) {
        activeUnsubscribe()
        activeUnsubscribe = null
        activeHandler = null
      }
    }
  }, [dispatch, folder, params, fallbacks, accountId])
}

/**
 * Update the mails cache by prepending new mail
 *
 * This function takes the latest SSE event data and prepends it to
 * the cached messages list for the specified folder.
 */
function updateMailsCache(
  dispatch: AppDispatch,
  folder: string,
  params: Record<string, string | number | boolean> | undefined,
  mailData: Record<string, unknown>,
  fallbacks?: MailReceivedListenerFallbacks,
  accountId: string = '0'
) {
  const defaultSubject = fallbacks?.defaultSubject ?? ''
  const defaultSenderName = fallbacks?.defaultSenderName ?? ''

  // Create a new mail object from SSE data
  const newMail: ImapMessagesList = {
    id: (mailData.id as string) || `mail-${Date.now()}`,
    subject: (mailData.subject as string) || defaultSubject,
    from: {
      name:
        ((mailData.from as Record<string, unknown>)?.name as string) ||
        defaultSenderName,
      email:
        ((mailData.from as Record<string, unknown>)?.email as string) || '',
    },
    to: [],
    date: (mailData.receivedAt as string) || new Date().toISOString(),
    seen: false,
    flagged: false,
    hasAttachment: false,
    snippet: (mailData.preview as string) || '',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
  }
  try {
    // RTK Query's `updateQueryData` matches cache entries by deep-equal args.
    // The folder-messages query is invoked with `{ folder, accountId, params }`
    // where `params` includes list defaults (page_size, fields, ...). Passing a
    // hand-built arg (e.g. with `params: undefined`) never matches, so we walk
    // every cached arg of the endpoint and update only the matching folders.
    dispatch((_dispatchThunk, getState) => {
      const queryState = (getState() as RootState)[apiSlice.reducerPath]?.queries
      if (!queryState) return

      for (const cacheKey of Object.keys(queryState)) {
        const entry = queryState[cacheKey]
        const originalArgs = entry?.originalArgs as
          | {
              folder?: string
              accountId?: string | number
              params?: Record<string, string | number | boolean>
            }
          | undefined
        if (!entry || entry.endpointName !== 'getFolderMessages') continue
        // Only touch cache entries for the folder this registration belongs to.
        if (originalArgs?.folder !== folder) continue
        if (String(originalArgs?.accountId ?? '0') !== String(accountId)) continue

        _dispatchThunk(
          apiSlice.util.updateQueryData('getFolderMessages', originalArgs as never, (draft) => {
            // The folder-messages cache is normalized to `{ mails, total, ... }`.
            if (!draft?.mails) return
            if (draft.mails.some((m) => String(m.id) === String(newMail.id))) return
            draft.mails.unshift(newMail)
            if (typeof draft.total === 'number') {
              draft.total += 1
            }
          }) as Parameters<AppDispatch>[0]
        )
      }
    })
  } catch (error) {
    logger.error('Error updating mails cache:', { error: error })
  }
}
