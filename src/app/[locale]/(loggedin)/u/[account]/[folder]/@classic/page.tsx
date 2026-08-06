'use client'

import MessagesList from '@/features/mails/components/list'
import ListSkeleton from '@/features/mails/components/skeletons/list-skeleton'
import { useFolderMessages } from '@/features/mails/hooks/use-folder-messages'
import useKeyboardShortcuts from '@/features/mails/hooks/use-keyboard-shortcuts'
import { useMailItemActions } from '@/features/mails/hooks/use-mail-item-actions'
import { getClientFilteredMails } from '@/features/mails/utils/client-mail-list-filter'
import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { RootState } from '@/lib/redux/store'
import { setSelectedMails } from '@/features/mails/store/mail-layout-slice'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

const Page: React.FC = () => {
  const { folder, account, mail_id } = useParams()
  const folderPath = folderPathFromParams(
    folder as string | string[] | undefined
  )
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')
  const mailLayoutMode = useSelector((state: RootState) => state.mailLayout.mode)
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get('filter') ?? 'all'
  const router = useRouter()
  const dispatch = useAppDispatch()
  const selectedIds = useAppSelector(
    (state: RootState) => state.mailLayout.selectedMailIds
  )
  const selectedMailId = selectedIds.length === 1 ? selectedIds[0] : null

  const { data, isFetching } = useFolderMessages({
    folder: folderPath,
    accountId: accountString,
  })

  const {
    deleteMail,
    toggleRead,
    archiveMail,
    markSpam,
    markHam,
    isJunk,
  } = useMailItemActions({
    accountId: accountString,
    folder: folderPath,
  })

  const filteredMails = React.useMemo(
    () => getClientFilteredMails(data?.mails ?? [], activeFilter),
    [data, activeFilter]
  )

  const mailIds = React.useMemo(
    () => filteredMails.map((m) => String(m.id)),
    [filteredMails]
  )

  // Keyboard shortcuts
  const handleSelectMail = useCallback(
    (id: string) => dispatch(setSelectedMails([id])),
    [dispatch]
  )
  const handleOpenMail = useCallback(
    (id: string) => router.push(`/u/${accountString}/${encodeURIComponent(folderPath)}/${id}`),
    [router, accountString, folderPath]
  )

  useKeyboardShortcuts({
    folder: folderPath,
    mailIds,
    selectedMailId,
    onSelectMail: handleSelectMail,
    onOpenMail: handleOpenMail,
    onArchiveMail: (id) => archiveMail(id),
    onDeleteMail: (id) => deleteMail(id),
    onToggleFlag: (id) => toggleRead(id, false),
  })

  const listVisibilityClass =
    mailLayoutMode === 'split'
      ? 'flex'
      : `${mail_id ? 'hidden lg:flex' : 'flex'}`

  if (isFetching) {
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
        items={filteredMails}
        page={data?.page ?? 1}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        hasNextPage={data?.hasNextPage ?? false}
        hasPreviousPage={data?.hasPreviousPage ?? false}
        isLoading={isFetching}
        hideToolbar
      />
    </div>
  )
}

export default Page
