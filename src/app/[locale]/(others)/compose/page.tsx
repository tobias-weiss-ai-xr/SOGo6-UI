'use client'

import { Button } from '@/components/ui/button'
import CustomEditor from '@/features/mails/components/compose/compose'
import ComposeHeader from '@/features/mails/components/compose/compose-header'
import styles from '@/features/mails/components/compose/compose.module.css'
import { cn } from '@/lib/utils'
import { createClientId } from '@/lib/utils/create-client-id'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createDraft } from '@/features/mails/store/mail-compose-slice'
import { Save, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'

export default function ComposePage() {
  const t = useTranslations('COMPOSE')
  const dispatch = useAppDispatch()

  // The standalone compose page needs a draft in the Redux store for the
  // editor/header to bind to (previously draftId was undefined → typing,
  // save and send did nothing).
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
  }, [dispatch, draftId])

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground flex h-12 shrink-0 items-center justify-between">
        <span className="text-sm font-medium">{t('new_message.string')}</span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex h-full flex-col">
          <ComposeHeader draftId={draftId} />
          <div
            className={cn(
              'mt-4 flex h-screen flex-1 flex-col',
              styles.compose_editor
            )}
          >
            <CustomEditor draftId={draftId} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-muted/50 flex items-center justify-between border-t px-4 py-2">
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          {t('save_draft.string')}
        </Button>
        <Button size="sm">
          <Send className="mr-2 h-4 w-4" />
          {t('send.string')}
        </Button>
      </div>
    </div>
  )
}
