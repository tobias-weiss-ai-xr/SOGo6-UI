'use client'

import { useLazySearchMailsQuery } from '@/features/mails/store/mails-api'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import type { ImapMessagesList } from '../mails-types'

interface UseMailSearchOptions {
  /** The current folder path */
  folder: string
  /** The account ID */
  accountId: string
}

interface UseMailSearchReturn {
  /** The current search query */
  query: string
  /** Whether a search is active (query is non-empty) */
  isSearching: boolean
  /** Search results (undefined when not searching or loading) */
  results: ImapMessagesList[] | undefined
  /** Whether the search API is loading */
  isLoading: boolean
  /** Whether the search API is fetching (loading more) */
  isFetching: boolean
  /** Set the search query (updates URL param and triggers search) */
  setQuery: (q: string) => void
  /** Clear search query and results */
  clearSearch: () => void
}

/**
 * Hook that manages mail search state via URL params.
 *
 * Reads/writes the `q` search param and triggers the mail search API
 * when the query changes.
 */
export function useMailSearch({
  folder,
  accountId,
}: UseMailSearchOptions): UseMailSearchReturn {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const queryParam = searchParams.get('q') ?? ''
  const isSearching = queryParam.length >= 2

  const [trigger, { data, isLoading, isFetching, isUninitialized }] =
    useLazySearchMailsQuery()

  // Trigger search when query changes (min 2 chars)
  useEffect(() => {
    if (isSearching && folder && accountId) {
      void trigger({ accountId, folder, q: queryParam })
    }
  }, [queryParam, folder, accountId, isSearching, trigger])

  const results = useMemo(() => {
    if (isUninitialized || !isSearching) return undefined
    return data
  }, [data, isUninitialized, isSearching])

  const setQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.length >= 2) {
        params.set('q', q)
      } else {
        params.delete('q')
      }
      const query = params.toString()
      replace(query ? `${pathname}?${query}` : pathname)
    },
    [searchParams, pathname, replace]
  )

  const clearSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    const query = params.toString()
    replace(query ? `${pathname}?${query}` : pathname)
  }, [searchParams, pathname, replace])

  return {
    query: queryParam,
    isSearching,
    results,
    isLoading,
    isFetching,
    setQuery,
    clearSearch,
  }
}
