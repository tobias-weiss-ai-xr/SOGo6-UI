'use client'

import { List, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type MailViewMode = 'flat' | 'conversation'

interface MailViewToggleProps {
  value: MailViewMode
  onChange: (mode: MailViewMode) => void
}

export default function MailViewToggle({ value, onChange }: MailViewToggleProps) {
  const t = useTranslations()

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v === 'flat' || v === 'conversation') onChange(v)
      }}
      size="sm"
      variant="outline"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="flat" aria-label={t('mails.viewFlat')}>
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('mails.viewFlat')}</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value="conversation"
            aria-label={t('mails.viewConversation')}
          >
            <MessageSquare className="h-4 w-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('mails.viewConversation')}</p>
        </TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )
}
