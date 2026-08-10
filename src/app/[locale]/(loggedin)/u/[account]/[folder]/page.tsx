'use client'

import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { VirtualFolderEmptyState } from '@/features/mails/components/virtual-folder-empty-state'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import {
  clearSearch,
  selectMailSearch,
  setSearchResults,
} from '@/features/mails/store/mail-search-slice'
import { useSearchMailsQuery } from '@/features/mails/store/mails-api'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

const Page = () => {
  const { folder, account } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const searchState = useAppSelector(selectMailSearch)

  // When search is active, skip the folder fetch and use search results instead
  useEffect(() => {
    if (searchState.isActive) {
      dispatch(setSkipFolderFetch(true))
    } else {
      dispatch(setSkipFolderFetch(false))
    }
  }, [searchState.isActive, dispatch])

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    currentPage,
    isVirtualFolder,
  } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
  })

  // Search query
  const {
    data: searchData,
    isLoading: searchIsLoading,
    isFetching: searchIsFetching,
    error: searchError,
  } = useSearchMailsQuery(
    {
      accountId: accountString,
      params: {
        ...searchState.searchParams,
        page: searchState.page,
      },
    },
    {
      skip: !searchState.isActive,
    }
  )

  // Sync search results to store when they arrive
  useEffect(() => {
    if (searchData && searchState.isActive) {
      dispatch(
        setSearchResults({
          results: searchData.mails,
          total: searchData.total,
          page: searchData.page,
          totalPages: searchData.totalPages,
        })
      )
    }
  }, [searchData, searchState.isActive, dispatch])

  // Clear search when navigating to a different folder
  useEffect(() => {
    dispatch(clearSearch())
  }, [folderPath, dispatch])

  const clientFilterActive = activeFilter !== 'all'

  // Keep the URL page in range
  useEffect(() => {
    if (isLoading || isFetching || error || clientFilterActive || !data) return
    const totalPages = data.totalPages ?? 1
    if (currentPage <= 1 || currentPage <= totalPages) return
    const target = Math.max(1, totalPages)
    const params = new URLSearchParams(searchParams.toString())
    if (target === 1) {
      params.delete('page')
    } else {
      params.set('page', String(target))
    }
    const query = params.toString()
    replace(query ? `${pathname}?${query}` : pathname)
  }, [
    data,
    isLoading,
    isFetching,
    error,
    clientFilterActive,
    currentPage,
    searchParams,
    pathname,
    replace,
  ])

  const filteredMails = React.useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  // When search is active, show search results
  if (searchState.isActive) {
    if (searchIsLoading) return <ListSkeleton />

    if (searchError) {
      return (
        <FolderMessagesErrorFallback
          error={searchError}
          refetch={() => {
            void refetch()
          }}
          accountId={accountString}
        />
      )
    }

    return (
      <MessagesList
        items={searchState.results}
        page={searchState.page}
        total={searchState.total}
        totalPages={searchState.totalPages}
        isLoading={searchIsLoading}
        isFetching={searchIsFetching}
        hideToolbar
      />
    )
  }

  if (isVirtualFolder) {
    return <VirtualFolderEmptyState />
  }

  if (isLoading) return <ListSkeleton />

  if (error) {
    return (
      <FolderMessagesErrorFallback
        error={error}
        refetch={() => {
          void refetch()
        }}
        accountId={accountString}
      />
    )
  }

  return (
    <MessagesList
      items={filteredMails}
      page={clientFilterActive ? 1 : (data?.page ?? 1)}
      total={clientFilterActive ? filteredMails.length : (data?.total ?? 0)}
      totalPages={clientFilterActive ? 1 : (data?.totalPages ?? 1)}
      hasNextPage={clientFilterActive ? false : (data?.hasNextPage ?? false)}
      hasPreviousPage={clientFilterActive ? false : (data?.hasPreviousPage ?? false)}
      isLoading={isLoading}
      isFetching={isFetching}
      hideToolbar
    />
  )
}

export default Page
