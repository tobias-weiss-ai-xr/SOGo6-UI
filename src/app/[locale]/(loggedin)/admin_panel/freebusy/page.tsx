'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetFreeBusyMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Search, CalendarRange, UserCircle } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function FreeBusyPage(): ReactNode {
  const t = useTranslations('AP_FREEBUSY')
  const [targetUids, setTargetUids] = useState('')
  const [dateStart, setDateStart] = useState('2025-01-15T00:00:00Z')
  const [dateEnd, setDateEnd] = useState('2025-01-15T23:59:59Z')
  const [lookup, { data, isLoading }] = useGetFreeBusyMutation()

  const handleLookup = useCallback(async () => {
    const uids = targetUids.split(',').map(u => u.trim()).filter(Boolean)
    if (uids.length === 0) { toast.error(t('errors.fields.string')); return }
    try {
      await lookup({ target_uids: uids, start: dateStart, end: dateEnd }).unwrap()
    } catch { toast.error(t('error.string')) }
  }, [targetUids, dateStart, dateEnd, lookup, t])

  const busySlots = data?.busy ?? []
  const uidList = targetUids.split(',').map(u => u.trim()).filter(Boolean)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">{t('form.title.string')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('form.participants.string')}</Label>
            <Input value={targetUids} onChange={e => setTargetUids(e.target.value)} placeholder="alice@example.org, bob@example.org" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>{t('form.start.string')}</Label><Input type="datetime-local" value={dateStart.replace('Z', '')} onChange={e => setDateStart(e.target.value + 'Z')} /></div>
            <div className="space-y-2"><Label>{t('form.end.string')}</Label><Input type="datetime-local" value={dateEnd.replace('Z', '')} onChange={e => setDateEnd(e.target.value + 'Z')} /></div>
          </div>
          <Button onClick={handleLookup} disabled={isLoading}>
            <Search className="h-4 w-4 mr-1" /> {t('form.lookup.string')}
          </Button>
        </CardContent>
      </Card>

      {busySlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              {t('results.title.string')}
              <Badge variant="outline">{busySlots.length} slots</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {busySlots.map((slot: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{slot.uid || uidList[i % uidList.length]}</span>
                  <span className="text-xs text-muted-foreground">
                    {slot.start ? new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '?'} —
                    {slot.end ? new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '?'}
                  </span>
                  {slot.summary && <Badge variant="outline" className="text-xs">{slot.summary}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
