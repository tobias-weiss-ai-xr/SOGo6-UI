'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiClassifyMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Tags, Sparkles } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function AiClassifyPage(): ReactNode {
  const t = useTranslations('AI_CLASSIFY')
  const [text, setText] = useState('')
  const [subject, setSubject] = useState('')
  const [sender, setSender] = useState('')
  const [results, setResults] = useState<Array<{ label: string; confidence: number }>>([])
  const [classify, { isLoading }] = useAiClassifyMutation()
  const handleClassify = useCallback(async () => {
    if (!text) { toast.error(t('errors.empty.string')); return }
    try { const r = await classify({ text, subject, sender }).unwrap(); setResults(r.labels ?? []) }
    catch { toast.error(t('errors.fail.string')) }
  }, [text, subject, sender, classify, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Tags className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>{t('input.subject.string')}</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div><div className="space-y-2"><Label>{t('input.sender.string')}</Label><Input value={sender} onChange={e => setSender(e.target.value)} /></div></div>
            <div className="space-y-2"><Label>{t('input.body.string')}</Label><Textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder={t('input.placeholder.string')} /></div>
            <Button onClick={handleClassify} disabled={isLoading || !text} className="ml-auto"><Sparkles className="h-4 w-4 mr-1" /> {t('classify.string')}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t('output.title.string')}</CardTitle></CardHeader>
          <CardContent>{results.length > 0 ? (<div className="space-y-3">{results.map((r, i) => (<div key={i} className="flex items-center justify-between p-3 rounded-md bg-muted/50"><div className="flex items-center gap-2"><span className="font-medium capitalize">{r.label}</span></div><div className="flex items-center gap-2"><div className="w-24 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${r.confidence * 100}%` }} /></div><Badge variant="outline">{Math.round(r.confidence * 100)}%</Badge></div></div>))}</div>) : <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p>}</CardContent>
        </Card>
      </div>
    </div>
  )
}
