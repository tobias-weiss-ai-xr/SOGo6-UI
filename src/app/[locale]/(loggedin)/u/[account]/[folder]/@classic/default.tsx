'use client'

import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import MessagesList from '@/features/mails/components/list'
import MailListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { VirtualFolderEmptyState } from '@/features/mails/components/virtual-folder-empty-state'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { useMailSearch } from '@/features/mails/hooks/use-mail-search'
import { setSkipFolderFetch } from '@/features/mails/store/mail-navigation-slice'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'

const Page: React.FC = () => {
  const { folder, mail_id, account } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '')
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const searchQuery = searchParams.get('q') ?? ''
  const isSearchActive = searchQuery.length >= 2

  const { data, isLoading, isFetching, error, refetch, isVirtualFolder } =
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

  const filteredMails = useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  const displayMails = useMemo(
    () => (isSearchActive ? (mailSearch.results ?? []) : filteredMails),
    [isSearchActive, mailSearch.results, filteredMails]
  )

  const containerClassName = `${mail_id ? 'hidden lg:flex' : 'flex'} w-full`

  if (!isSearchActive && isVirtualFolder) {
    return (
      <div className={containerClassName}>
        <VirtualFolderEmptyState />
      </div>
    )
  }

  if (!isSearchActive && isLoading) {
    return (
      <div className={containerClassName}>
        <MailListSkeleton />
      </div>
    )
  }

  if (!isSearchActive && error) {
    return (
      <div className={containerClassName}>
        <FolderMessagesErrorFallback
          error={error}
          refetch={() => {
            void refetch()
          }}
          accountId={accountString}
        />
      </div>
    )
  }

  return (
    <div className={containerClassName}>
      <MessagesList
        type="classic"
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
    </div>
  )
}

export default Page
