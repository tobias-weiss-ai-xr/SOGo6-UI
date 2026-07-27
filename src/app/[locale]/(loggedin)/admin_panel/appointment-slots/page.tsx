'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListAppointmentSlotsQuery, useCreateAppointmentSlotMutation, useListSlotBookingsQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { CalendarClock, Plus, X, Copy, Check, ExternalLink } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AppointmentSlotsPage(): ReactNode {
  const t = useTranslations('AP_SLOTS')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('30')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [buffer, setBuffer] = useState('0')
  const [copied, setCopied] = useState<string | null>(null)

  const { data, isLoading } = useListAppointmentSlotsQuery()
  const { data: bookings } = useListSlotBookingsQuery()
  const [createSlot, { isLoading: creating }] = useCreateAppointmentSlotMutation()

  const slots = data ?? []
  const bookingList = bookings ?? []

  const toggleDay = useCallback((day: number) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }, [])

  const handleCreate = useCallback(async () => {
    if (!title || !duration || !startTime || !endTime || days.length === 0) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      await createSlot({
        title,
        duration_minutes: parseInt(duration),
        start_time: startTime,
        end_time: endTime,
        days_of_week: days,
        buffer_minutes: parseInt(buffer),
      }).unwrap()
      toast.success(t('create.success.string'))
      setTitle(''); setDuration('30'); setStartTime('09:00'); setEndTime('17:00')
      setDays([1, 2, 3, 4, 5]); setBuffer('0')
      setShowCreate(false)
    } catch {
      toast.error(t('create.error.string'))
    }
  }, [title, duration, startTime, endTime, days, buffer, createSlot, t])

  const handleCopy = useCallback((url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} variant={showCreate ? 'outline' : 'default'}>
          {showCreate ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreate ? t('form.cancel.string') : t('form.create.string')}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">{t('form.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('form.slot_title.string')}</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="30 min Meeting" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{t('form.duration.string')}</Label>
                  <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={15} max={240} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.buffer.string')}</Label>
                  <Input type="number" value={buffer} onChange={e => setBuffer(e.target.value)} min={0} max={60} />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('form.start_time.string')}</Label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('form.end_time.string')}</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('form.days.string')}</Label>
              <div className="flex gap-2">
                {DAYS_SHORT.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`w-10 h-10 rounded-md text-xs font-medium border transition-colors ${
                      days.includes(i) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              <CalendarClock className="h-4 w-4 mr-1" /> {t('form.submit.string')}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Slots */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t('slots.title.string')}</h2>
          {isLoading ? <Skeleton className="h-40" /> : slots.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('slots.empty.string')}</p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot: any) => (
                <Card key={slot.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-primary" />
                          <span className="font-medium">{slot.title}</span>
                          <Badge variant={slot.enabled !== false ? 'default' : 'secondary'} className={slot.enabled !== false ? 'bg-green-600' : ''}>
                            {slot.enabled !== false ? 'active' : 'disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {slot.duration_minutes}min · {slot.start_time}–{slot.end_time} · {slot.days_of_week?.map((d: number) => DAYS_SHORT[d]).join(', ')}
                        </p>
                      </div>
                      {slot.booking_url && (
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(slot.booking_url, slot.id)}>
                          {copied === slot.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Bookings */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t('bookings.title.string')}</h2>
          {bookingList.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('bookings.empty.string')}</p>
          ) : (
            <div className="space-y-2">
              {bookingList.map((b: any) => (
                <Card key={b.id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">{b.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{b.email}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{b.date} {b.time}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
