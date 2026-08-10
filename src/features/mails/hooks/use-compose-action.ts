'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { Pencil, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  createDraft,
  MAX_OPEN_DRAFTS,
  selectCanOpenNewDraft,
} from '../store'
import { createClientId } from '@/lib/utils/create-client-id'
import { useProfile } from '@/features/user-profile'

export function useComposeAction(options?: { closeMobileSidebar?: boolean }) {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const canOpen = useAppSelector(selectCanOpenNewDraft)
  const closeMobileSidebar = options?.closeMobileSidebar ?? true
  const { account } = useParams()
  const { sharedMailboxAccounts } = useProfile()

  // Get the current account ID from URL, handling both regular and shared mailboxes
  const accountString = Array.isArray(account) ? account[0] : (account ?? '0')

  const onClick = useCallback(() => {
    if (!canOpen) {
      toast.error(t('max_windows_error.string', { max: MAX_OPEN_DRAFTS }))
      return
    }

    if (closeMobileSidebar && isMobile) {
      setOpenMobile(false)
    }

    // Check if current account is a shared mailbox
    const isSharedMailbox = accountString.startsWith('shared-')
    const sharedMailbox = isSharedMailbox 
      ? sharedMailboxAccounts.find(m => m.id === accountString)
      : null

    // If composing from a shared mailbox, pre-select its identity
    const initialData = isSharedMailbox && sharedMailbox ? {
      selectedIdentity: {
        mail: sharedMailbox.email,
        name: sharedMailbox.name,
      },
    } : undefined

    dispatch(createDraft({ 
      draftId: createClientId(),
      initialData 
    }))
  }, [canOpen, closeMobileSidebar, dispatch, isMobile, setOpenMobile, t, accountString, sharedMailboxAccounts])

  return {
    onClick,
    label: t('new_message.string'),
    icon: Pencil as LucideIcon,
  }
}
