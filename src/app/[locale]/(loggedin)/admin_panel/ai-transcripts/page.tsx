'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListTranscriptsQuery, useCreateTranscriptMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { FileAudio, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function AiTranscriptsPage(): ReactNode {
  const t = useTranslations('AI_TRANSCRIPTS')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [eventId, setEventId] = useState('')
  const [attendees, setAttendees] = useState('')

  const { data, isLoading } = useListTranscriptsQuery()
  const [createTranscript, { isLoading: creating }] = useCreateTranscriptMutation()

  const transcripts = data 

  const handleCreate = useCallback(async () => {
    if (!title || !text) { toast.error(t('errors.fields.string')); return }
    try {
      await createTranscript({
        title,
        text,
        event_id: eventId,
        attendees: attendees.split(',').map(a => a.trim()).filter(Boolean),
        duration_minutes: 60,
      }).unwrap()
      toast.success(t('create.success.string'))
      setTitle(''); setText(''); setEventId(''); setAttendees('')
      setShowCreate(false)
    } catch { toast.error(t('create.error.string')) }
  }, [title, text, eventId, attendees, createTranscript, t])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileAudio className="h-6 w-6 text-primary" /> {t('title.string')}</h1>
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
              <div className="space-y-2"><Label>{t('form.meeting_title.string')}</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('form.event_id.string')}</Label><Input value={eventId} onChange={e => setEventId(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>{t('form.attendees.string')}</Label><Input value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="alice@, bob@" /></div>
            <div className="space-y-2"><Label>{t('form.transcript.string')}</Label><Textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder={t('form.placeholder.string')} /></div>
            <Button onClick={handleCreate} disabled={creating} className="ml-auto">
              <Sparkles className="h-4 w-4 mr-1" /> {t('form.submit.string')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : !transcripts || transcripts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12"><FileAudio className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>{t('list.empty.string')}</p></div>
      ) : (
        <div className="space-y-3">
          {transcripts.map((tr: any) => (
            <Card key={tr.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileAudio className="h-4 w-4 text-primary" />
                  <span className="font-medium">{tr.title}</span>
                  <Badge variant="outline">{tr.duration_minutes ?? 60}min</Badge>
                  <Badge variant="outline">{tr.attendees?.length ?? 0} attendees</Badge>
                </div>
                {tr.summary && (
                  <div className="mt-2 p-3 rounded bg-muted/50 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1"><Sparkles className="h-3 w-3" /> <span className="text-xs font-medium">Summary</span></div>
                    <p className="line-clamp-3">{tr.summary}</p>
                  </div>
                )}
                {tr.action_items?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tr.action_items.slice(0, 5).map((item: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs"><CheckCircle2 className="h-2 w-2 mr-1" /> {item.text?.slice(0, 50)}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
