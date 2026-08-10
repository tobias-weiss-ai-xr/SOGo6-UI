'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiSuggestMeetingTimesMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { CalendarClock, Sparkles, Star } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function AiSchedulePage(): ReactNode {
  const t = useTranslations('AI_SCHEDULE')
  const [attendees, setAttendees] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [duration, setDuration] = useState('60')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggestTimes, { isLoading }] = useAiSuggestMeetingTimesMutation()
  const handleSuggest = useCallback(async () => {
    if (!attendees || !dateFrom || !dateTo) { toast.error(t('errors.fields.string')); return }
    try {
      const uids = attendees.split(',').map(u => u.trim()).filter(Boolean)
      const r = await suggestTimes({ attendee_uids: uids, date_from: dateFrom, date_to: dateTo, duration_minutes: parseInt(duration), preferred_hours: [9, 10, 11, 14, 15, 16] }).unwrap()
      setSuggestions(r.suggestions ?? [])
    } catch { toast.error(t('errors.fail.string')) }
  }, [attendees, dateFrom, dateTo, duration, suggestTimes, t])
  const maxScore = suggestions.length > 0 ? Math.max(...suggestions.map(s => s.score)) : 1
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><CalendarClock className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>{t('input.attendees.string')}</Label><Input value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="alice@example.org, bob@example.org" /></div>
          <div className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label>{t('input.from.string')}</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div><div className="space-y-2"><Label>{t('input.to.string')}</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div><div className="space-y-2"><Label>{t('input.duration.string')}</Label><Input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={15} max={480} /></div></div>
          <Button onClick={handleSuggest} disabled={isLoading} className="ml-auto"><Sparkles className="h-4 w-4 mr-1" /> {t('suggest.string')}</Button>
        </CardContent>
      </Card>
      {suggestions.length > 0 && (
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> {t('output.title.string')}</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{suggestions.map((s, i) => (<div key={i} className="flex items-center justify-between p-3 rounded-md bg-muted/50 border"><div className="flex items-center gap-3"><Badge variant={i === 0 ? 'default' : 'outline'} className={i === 0 ? 'bg-green-600' : ''}>#{i + 1}</Badge><div><span className="font-medium text-sm">{s.day}</span><span className="text-sm text-muted-foreground ml-2">{s.hour}:00</span></div></div><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(s.score / maxScore) * 100}%` }} /></div><span className="text-xs text-muted-foreground">{Math.round(s.score)}</span></div></div>))}</div></CardContent>
        </Card>
      )}
    </div>
  )
}
