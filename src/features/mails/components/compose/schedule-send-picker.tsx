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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

interface ScheduleSendPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (isoDateTime: string) => void
  onClear: () => void
  currentValue?: string | null
  minDate?: Date
  maxDate?: Date
}

/** Generates an array of time slots at 30-minute intervals. */
function generateTimeSlots(): { label: string; value: string }[] {
  const slots: { label: string; value: string }[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of ['00', '30']) {
      const label = `${String(h).padStart(2, '0')}:${m}`
      slots.push({ label, value: `${h.toString().padStart(2, '0')}:${m}` })
    }
  }
  return slots
}

export default function ScheduleSendPicker({
  open,
  onOpenChange,
  onConfirm,
  onClear,
  currentValue,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
}: ScheduleSendPickerProps) {
  const t = useTranslations('COMPOSE')
  const timeSlots = React.useMemo(() => generateTimeSlots(), [])

  // Parse current value or default to now + 1 hour
  const now = new Date()
  const defaultDate = currentValue
    ? new Date(currentValue)
    : new Date(now.getTime() + 60 * 60 * 1000)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    defaultDate > now ? defaultDate : new Date(now.getTime() + 60 * 60 * 1000)
  )
  const [selectedTime, setSelectedTime] = useState(
    `${String(defaultDate.getHours()).padStart(2, '0')}:${String(
      defaultDate.getMinutes()
    ).padStart(2, '0')}`
  )

  const handleConfirm = () => {
    if (!selectedDate) return
    const [h, m] = selectedTime.split(':').map(Number)
    const dt = new Date(selectedDate)
    dt.setHours(h, m, 0, 0)
    if (dt <= now) return // Don't allow past times
    onConfirm(dt.toISOString())
    onOpenChange(false)
  }

  const handleClear = () => {
    onClear()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('scheduleSend.title')}</DialogTitle>
          <DialogDescription>
            {t('scheduleSend.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Date picker */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            disabled={(d) => d < new Date() || d > maxDate}
            fromDate={minDate}
            toDate={maxDate}
            className="mx-auto"
          />

          {/* Time picker */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {t('scheduleSend.time')}:
            </span>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentValue && (
            <p className="text-xs text-muted-foreground">
              {t('scheduleSend.currentlyScheduled', {
                time: new Date(currentValue).toLocaleString(),
              })}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentValue && (
            <Button variant="outline" onClick={handleClear}>
              {t('scheduleSend.clear')}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel.string')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedDate}>
            {t('scheduleSend.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
