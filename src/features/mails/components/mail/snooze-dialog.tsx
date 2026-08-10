'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSnoozeMailsMutation } from '@/features/mails/store/snooze-api'
import { useTranslations } from 'next-intl'
import { CalendarIcon, Clock, Sun, Moon, CalendarDays, ChevronRight } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { format, addHours, addDays, startOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SnoozeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folder: string
  mailIds: string[]
  onSnoozed?: () => void
}

const PRESETS = [
  { key: 'later_today', hours: 3 },
  { key: 'tomorrow', hours: 24 },
  { key: 'this_weekend', days: 5 },
  { key: 'next_week', days: 7 },
] as const

function getPresetDate(preset: string): Date {
  const now = new Date()
  switch (preset) {
    case 'later_today':
      return addHours(now, 3)
    case 'tomorrow':
      return addHours(now, 24)
    case 'this_weekend':
      return addDays(startOfWeek(now, { weekStartsOn: 1 }), 5)
    case 'next_week':
      return addDays(now, 7)
    default:
      return addHours(now, 24)
  }
}

function getPresetIcon(key: string) {
  switch (key) {
    case 'later_today':
      return <Clock className="h-4 w-4" />
    case 'tomorrow':
      return <Sun className="h-4 w-4" />
    case 'this_weekend':
      return <Moon className="h-4 w-4" />
    case 'next_week':
      return <CalendarDays className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export default function SnoozeDialog({
  open,
  onOpenChange,
  accountId,
  folder,
  mailIds,
  onSnoozed,
}: SnoozeDialogProps) {
  const t = useTranslations('MAIL_SNOOZE')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [snoozeMails, { isLoading }] = useSnoozeMailsMutation()

  const handlePreset = useCallback(
    async (preset: { key: string }) => {
      try {
        await snoozeMails({
          account_id: accountId,
          mail_uids: mailIds,
          folder,
          preset: preset.key as 'later_today' | 'tomorrow' | 'this_weekend' | 'next_week',
        }).unwrap()
        toast.success(t('success.string'))
        onOpenChange(false)
        setDate(undefined)
        onSnoozed?.()
      } catch {
        toast.error(t('error.string'))
      }
    },
    [snoozeMails, accountId, folder, mailIds, t, onSnoozed, onOpenChange],
  )

  const handleCustomDate = useCallback(async () => {
    if (!date) return
    try {
      await snoozeMails({
        account_id: accountId,
        mail_uids: mailIds,
        folder,
        snooze_until: date.toISOString(),
      }).unwrap()
      toast.success(t('success.string'))
      onOpenChange(false)
      setDate(undefined)
      setCalendarOpen(false)
      onSnoozed?.()
    } catch {
      toast.error(t('error.string'))
    }
  }, [snoozeMails, accountId, folder, mailIds, date, t, onSnoozed, onOpenChange])

  const snoozeDate = date ? format(date, 'MMM d, yyyy \'at\' h:mm a') : undefined

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setDate(undefined) }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('title.string')}</DialogTitle>
          <DialogDescription>{t('description.string')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Preset buttons */}
          <div className="space-y-1">
            {PRESETS.map((preset) => {
              const presetDate = getPresetDate(preset.key)
              return (
                <button
                  key={preset.key}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => handlePreset(preset)}
                  disabled={isLoading}
                >
                  {getPresetIcon(preset.key)}
                  <span className="font-medium">{t(`presets.${preset.key}.string`)}</span>
                  <span className="ml-auto text-muted-foreground">
                    {format(presetDate, 'EEE, MMM d \'at\' h:mm a')}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Custom date picker */}
          <div className="border-t pt-3 space-y-2">
            <Label>{t('pick_date.string')}</Label>
            <div className="flex items-center gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal flex-1',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {snoozeDate || t('pick_date_placeholder.string')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              {date && (
                <Button size="sm" onClick={handleCustomDate} disabled={isLoading}>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  {t('snooze_button.string')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
