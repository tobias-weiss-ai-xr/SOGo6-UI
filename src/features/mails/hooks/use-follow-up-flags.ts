'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sogo_follow_up_dates'

export interface FollowUpEntry {
  /** Message-ID or UID of the mail */
  mailId: string
  /** ISO 8601 date when the follow-up is due */
  dueDate: string
  /** Optional note */
  note?: string
  /** When the follow-up was created */
  createdAt: string
}

function getEntries(): Record<string, FollowUpEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setEntries(entries: Record<string, FollowUpEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // ignore
  }
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  for (const l of listeners) l()
}

/**
 * Hook to manage follow-up flag dates on emails.
 * Stores dates in localStorage keyed by mail ID.
 */
export function useFollowUpFlags() {
  const entries = useSyncExternalStore(subscribe, getEntries, getEntries)

  const setFollowUp = useCallback(
    (mailId: string, dueDate: string, note?: string) => {
      const all = getEntries()
      all[mailId] = {
        mailId,
        dueDate,
        note: note || '',
        createdAt: new Date().toISOString(),
      }
      setEntries(all)
      notify()
    },
    []
  )

  const clearFollowUp = useCallback((mailId: string) => {
    const all = getEntries()
    delete all[mailId]
    setEntries(all)
    notify()
  }, [])

  const getFollowUp = useCallback(
    (mailId: string): FollowUpEntry | undefined => {
      return entries[mailId]
    },
    [entries]
  )

  const isOverdue = useCallback(
    (mailId: string): boolean => {
      const entry = entries[mailId]
      if (!entry) return false
      return new Date(entry.dueDate) < new Date()
    },
    [entries]
  )

  return {
    followUps: entries,
    setFollowUp,
    clearFollowUp,
    getFollowUp,
    isOverdue,
  }
}
