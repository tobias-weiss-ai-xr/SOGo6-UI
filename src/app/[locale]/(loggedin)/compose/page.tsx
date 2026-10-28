'use client'

import { FloatingCompose } from '@/features/mails/components/compose/floating-compose'
import {
  createDraft,
  setActiveDraft,
} from '@/features/mails/store/mail-compose-slice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createClientId } from '@/lib/utils/create-client-id'
import { useEffect, useMemo } from 'react'

export default function ComposePage() {
  const dispatch = useAppDispatch()

  // The standalone compose page needs a draft in the Redux store for the
  // editor to bind to (typing, save and send all target the draft id).
  const draftId = useMemo(() => createClientId(), [])

  useEffect(() => {
    dispatch(
      createDraft({
        draftId,
        initialData: {
          to: [],
          cc: [],
          bcc: [],
          subject: '',
          body: '',
          attachments: [],
        },
      })
    )
    dispatch(setActiveDraft(draftId))
  }, [dispatch, draftId])

  return <FloatingCompose fullPage draftId={draftId} />
}
