'use client'

import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { VirtualFolderEmptyState } from '@/features/mails/components/virtual-folder-empty-state'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { useMailSearch } from '@/features/mails/hooks/use-mail-search'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'

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
  const searchQuery = searchParams.get('q') ?? ''
  const isSearchActive = searchQuery.length >= 2

  const { data, isLoading, isFetching, error, refetch, currentPage, isVirtualFolder } =
    useFolderMessages({
      folder: folderPath,
      accountId: accountString,
    })

  const mailSearch = useMailSearch({
    folder: folderPath,
    accountId: accountString,
  })

  useEffect(() => {
    dispatch(setSkipFolderFetch(false))
  }, [folderPath, dispatch])

  const clientFilterActive = !isSearchActive && activeFilter !== 'all'

  // Keep the URL page in range (only when not searching)
  useEffect(() => {
    if (isSearchActive || isLoading || isFetching || error || clientFilterActive || !data) return
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
    isSearchActive,
  ])

  const filteredMails = useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  const displayMails = isSearchActive
    ? (mailSearch.results ?? [])
    : filteredMails

  if (isVirtualFolder && !isSearchActive) {
    return <VirtualFolderEmptyState />
  }

  if (!isSearchActive && isLoading) return <ListSkeleton />

  if (!isSearchActive && error) {
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
      items={displayMails}
      page={isSearchActive ? 1 : (data?.page ?? 1)}
      total={isSearchActive ? (mailSearch.results?.length ?? 0) : (data?.total ?? 0)}
      totalPages={isSearchActive ? 1 : (data?.totalPages ?? 1)}
      hasNextPage={isSearchActive ? false : (data?.hasNextPage ?? false)}
      hasPreviousPage={isSearchActive ? false : (data?.hasPreviousPage ?? false)}
      isLoading={!isSearchActive && isLoading}
      isFetching={isSearchActive ? mailSearch.isFetching : isFetching}
      hideToolbar
    />
  )
}

export default Page
