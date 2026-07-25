'use client'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Link, Link2Off, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import {
  useDisableSubscriptionMutation,
  useEnableSubscriptionMutation,
  useGetCalendarByIdQuery,
} from '../../../store/calendars-api'

interface LinkActionProps {
  id: string
}

const LinkAction: React.FC<LinkActionProps> = ({ id }) => {
  const t = useTranslations('CALENDARS')
  const { data: calendar } = useGetCalendarByIdQuery(id)
  const [enableSubscription, { isLoading: isEnabling }] =
    useEnableSubscriptionMutation()
  const [disableSubscription, { isLoading: isDisabling }] =
    useDisableSubscriptionMutation()
  const [publicUrl, setPublicUrl] = useState<string | null>(null)

  const shareToken = publicUrl ?? calendar?.share_token ?? null
  const hasSubscription = Boolean(shareToken)
  const isProcessing = isEnabling || isDisabling

  const handleEnable = async () => {
    try {
      const result = await enableSubscription(id).unwrap()
      setPublicUrl(result.public_url)
    } catch {
      // Notifications handled by RTK query
    }
  }

  const handleDisable = async () => {
    try {
      await disableSubscription(id).unwrap()
      setPublicUrl(null)
    } catch {
      // Notifications handled by RTK query
    }
  }

  const subscribeUrl =
    publicUrl ??
    (shareToken
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public/calendars/${shareToken}`
      : null)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.link.string')}</DialogTitle>
        <DialogDescription>
          {t('sidebar.link.description.string')}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {hasSubscription && subscribeUrl ? (
          <>
            <Input value={subscribeUrl} readOnly />
            <p className="text-muted-foreground text-xs">
              {t('sidebar.link.description.string')}
            </p>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isProcessing}
              className="w-full"
            >
              {isDisabling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link2Off className="mr-2 h-4 w-4" />
              )}
              {t('sidebar.link.string')}
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              {t('sidebar.link.description.string')}
            </p>
            <Button
              onClick={handleEnable}
              disabled={isProcessing}
              className="w-full"
            >
              {isEnabling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link className="mr-2 h-4 w-4" />
              )}
              {t('sidebar.link.string')}
            </Button>
          </>
        )}
      </div>
    </>
  )
}

export default LinkAction
