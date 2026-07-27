'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListSchedulingPollsQuery, useCreateSchedulingPollMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { CalendarDays, Plus, X, Users, CheckCircle2, Clock } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SchedulingPollsPage(): ReactNode {
  const t = useTranslations('AP_POLLS')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [participants, setParticipants] = useState('')
  const [slots, setSlots] = useState<Array<{ start: string; end: string }>>([
    { start: '2025-01-15T09:00:00Z', end: '2025-01-15T10:00:00Z' },
    { start: '2025-01-15T14:00:00Z', end: '2025-01-15T15:00:00Z' },
    { start: '2025-01-16T09:00:00Z', end: '2025-01-16T10:00:00Z' },
  ])

  const { data, isLoading, refetch } = useListSchedulingPollsQuery()
  const [createPoll, { isLoading: creating }] = useCreateSchedulingPollMutation()

  const polls = data ?? []

  const addSlot = useCallback(() => {
    setSlots(prev => [...prev, { start: '', end: '' }])
  }, [])

  const removeSlot = useCallback((idx: number) => {
    setSlots(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const updateSlot = useCallback((idx: number, field: 'start' | 'end', value: string) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }, [])

  const handleCreate = useCallback(async () => {
    if (!title || slots.length === 0 || !participants) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      await createPoll({
        title,
        description,
        time_slots: slots.filter(s => s.start && s.end),
        participants: participants.split(',').map(p => p.trim()).filter(Boolean),
      }).unwrap()
      toast.success(t('create.success.string'))
      setTitle(''); setDescription(''); setParticipants('')
      setSlots([{ start: '2025-01-15T09:00:00Z', end: '2025-01-15T10:00:00Z' }])
      setShowCreate(false)
    } catch {
      toast.error(t('create.error.string'))
    }
  }, [title, description, participants, slots, createPoll, t])

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
                <Label>{t('form.poll_title.string')}</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('form.title_hint.string')} />
              </div>
              <div className="space-y-2">
                <Label>{t('form.participants.string')}</Label>
                <Input value={participants} onChange={e => setParticipants(e.target.value)} placeholder="alice@example.org, bob@example.org" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('form.description.string')}</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('form.time_slots.string')}</Label>
                <Button variant="outline" size="sm" onClick={addSlot}><Plus className="h-3 w-3 mr-1" /> {t('form.add_slot.string')}</Button>
              </div>
              {slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input type="datetime-local" value={slot.start.replace('Z', '')} onChange={e => updateSlot(idx, 'start', e.target.value + 'Z')} className="flex-1" />
                  <span className="text-muted-foreground">→</span>
                  <Input type="datetime-local" value={slot.end.replace('Z', '')} onChange={e => updateSlot(idx, 'end', e.target.value + 'Z')} className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => removeSlot(idx)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              <CalendarDays className="h-4 w-4 mr-1" /> {t('form.submit.string')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : polls.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t('list.empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map((poll: any) => (
            <Card key={poll.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="font-medium">{poll.title}</span>
                  <Badge variant={poll.status === 'open' ? 'default' : 'secondary'} className={poll.status === 'open' ? 'bg-green-600' : ''}>
                    {poll.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {poll.participants?.length ?? 0} participants</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {poll.time_slots?.length ?? 0} slots</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
