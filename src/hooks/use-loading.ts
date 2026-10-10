'use client'

import { useCallback, useState } from 'react'

export interface UseLoadingReturn {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

/**
 * Hook to manage loading states.
 * Usage:
 * const { isLoading, withLoading } = useLoading()
 *
 * const fetchData = async () => {
 *   await withLoading(async () => {
 *     return await api.fetchData()
 *   })
 * }
 */
export function useLoading(initialState = false): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsLoading(true)
      try {
        return await fn()
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}
