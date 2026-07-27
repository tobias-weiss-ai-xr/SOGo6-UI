'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

interface FollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mailId: string
  currentDueDate?: string
  onSetFollowUp: (mailId: string, dueDate: string) => void
  onClearFollowUp: (mailId: string) => void
}

export default function FollowUpDialog({
  open,
  onOpenChange,
  mailId,
  currentDueDate,
  onSetFollowUp,
  onClearFollowUp,
}: FollowUpDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [date, setDate] = useState<Date | undefined>(
    currentDueDate ? new Date(currentDueDate) : new Date(Date.now() + 86400000)
  )

  const handleConfirm = () => {
    if (!date) return
    onSetFollowUp(mailId, date.toISOString())
    onOpenChange(false)
  }

  const handleClear = () => {
    onClearFollowUp(mailId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>
            {currentDueDate ? t('followUp.changeTitle') : t('followUp.title')}
          </DialogTitle>
          <DialogDescription>
            {t('followUp.description')}
          </DialogDescription>
        </DialogHeader>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && setDate(d)}
          disabled={(d) => d < new Date()}
          className="mx-auto"
        />
        <DialogFooter className="gap-2">
          {currentDueDate && (
            <Button variant="outline" onClick={handleClear}>
              <BellOff className="mr-2 h-4 w-4" />
              {t('followUp.clear')}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel.string')}
          </Button>
          <Button onClick={handleConfirm} disabled={!date}>
            <Bell className="mr-2 h-4 w-4" />
            {t('followUp.set')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
