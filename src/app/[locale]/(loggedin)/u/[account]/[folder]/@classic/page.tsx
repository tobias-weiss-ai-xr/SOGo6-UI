'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import { useMailSearch } from '@/features/mails/hooks/use-mail-search'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { RootState } from '@/lib/redux/store'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

const Page: React.FC = () => {
  const { folder, account, mail_id } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')
  const mailLayoutMode = useSelector((state: RootState) => state.mailLayout.mode)
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const searchQuery = searchParams.get('q') ?? ''
  const isSearchActive = searchQuery.length >= 2

  const { data, isFetching } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
  })

  const mailSearch = useMailSearch({
    folder: folderPath,
    accountId: accountString,
  })

  const filteredMails = useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  const displayMails = isSearchActive
    ? (mailSearch.results ?? [])
    : filteredMails

  const listVisibilityClass =
    mailLayoutMode === 'split'
      ? 'flex'
      : `${mail_id ? 'hidden lg:flex' : 'flex'}`

  if (!isSearchActive && isFetching) {
    return (
      <div className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}>
        <ListSkeleton />
      </div>
    )
  }

  return (
    <div className={`${listVisibilityClass} h-full w-full flex-col overflow-hidden`}>
      <MessagesList
        type="classic"
        items={displayMails}
        page={isSearchActive ? 1 : (data?.page ?? 1)}
        total={isSearchActive ? (mailSearch.results?.length ?? 0) : (data?.total ?? 0)}
        totalPages={isSearchActive ? 1 : (data?.totalPages ?? 1)}
        hasNextPage={isSearchActive ? false : (data?.hasNextPage ?? false)}
        hasPreviousPage={isSearchActive ? false : (data?.hasPreviousPage ?? false)}
        isLoading={!isSearchActive && isFetching}
        hideToolbar
      />
    </div>
  )
}

export default Page
