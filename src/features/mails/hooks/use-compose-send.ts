'use client'

import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import React from 'react'
import { toast } from 'sonner'
import { closeDraft } from '../store'
import {
  useCancelPendingSendMutation,
  useSendMailMutation,
} from '../store/mail-api'
import {
  buildComposeMailPayload,
  type ComposeMailFields,
} from '../utils/build-compose-mail-payload'

export type EmptyContentAlert = 'subject' | 'body' | 'both'

interface UseComposeSendOptions extends ComposeMailFields {
  draftId: string
  accountId: string
  mailKey: string | null
}

export function useComposeSend({
  draftId,
  accountId,
  mailKey,
  toRecipients,
  subject,
  body,
  ...mailFields
}: UseComposeSendOptions) {
  const t = useTranslations('NOTIFICATIONS')
  const dispatch = useAppDispatch()
  const [sendMail, { isLoading: isSending }] = useSendMailMutation()
  const [cancelPendingSend] = useCancelPendingSendMutation()

  const [showNoRecipientAlert, setShowNoRecipientAlert] = React.useState(false)
  const [emptyContentAlert, setEmptyContentAlert] =
    React.useState<EmptyContentAlert | null>(null)

  const performSend = async () => {
    if (!mailFields.selectedIdentity?.mail) return

    const result = await sendMail({
      accountId,
      mailKey,
      mail: buildComposeMailPayload({
        toRecipients,
        subject,
        body,
        ...mailFields,
      }),
    })

    if ('error' in result) return

    // Undo Send: the server held the email in a pending state and returned a
    // pending_key. Keep the compose window open and offer an Undo toast.
    const sendData = result.data?.data
    if (sendData?.status === 'pending' && sendData.pending_key) {
      const pendingKey = sendData.pending_key
      const remainingMs = sendData.undo_available_until
        ? Math.max(0, Math.round((sendData.undo_available_until * 1000) - Date.now()))
        : 10_000

      toast.success(t('mail_send.undo.message.string'), {
        duration: remainingMs,
        action: {
          label: t('mail_send.undo.action.string'),
          onClick: () => {
            cancelPendingSend({ accountId, pendingKey })
          },
        },
      })
      // Do NOT close the draft — the email is still cancellable.
      return
    }

    dispatch(closeDraft({ draftId }))
  }

  const handleSend = async () => {
    if (!mailFields.selectedIdentity?.mail) return

    if (toRecipients.length === 0) {
      setShowNoRecipientAlert(true)
      return
    }

    const isSubjectEmpty = subject.trim().length === 0
    const isBodyEmpty = body.trim().length === 0

    if (isSubjectEmpty && isBodyEmpty) {
      setEmptyContentAlert('both')
      return
    }
    if (isSubjectEmpty) {
      setEmptyContentAlert('subject')
      return
    }
    if (isBodyEmpty) {
      setEmptyContentAlert('body')
      return
    }

    await performSend()
  }

  const handleConfirmSendAnyway = async () => {
    setEmptyContentAlert(null)
    await performSend()
  }

  return {
    isSending,
    handleSend,
    handleConfirmSendAnyway,
    showNoRecipientAlert,
    setShowNoRecipientAlert,
    emptyContentAlert,
    setEmptyContentAlert,
  }
}
