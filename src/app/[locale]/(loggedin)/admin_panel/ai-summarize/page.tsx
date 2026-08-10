'use client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiSummarizeMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Sparkles, Copy, Check } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function AiSummarizePage(): ReactNode {
  const t = useTranslations('AI_SUMMARIZE')
  const [text, setText] = useState('')
  const [maxSentences, setMaxSentences] = useState(3)
  const [summary, setSummary] = useState('')
  const [copied, setCopied] = useState(false)
  const [summarize, { isLoading }] = useAiSummarizeMutation()
  const handleSummarize = useCallback(async () => {
    if (!text) { toast.error(t('errors.empty.string')); return }
    try { const r = await summarize({ text, max_sentences: maxSentences }).unwrap(); setSummary(r.summary ?? '') }
    catch { toast.error(t('errors.fail.string')) }
  }, [text, maxSentences, summarize, t])
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> {t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>{t('input.text.string')}</Label><Textarea value={text} onChange={e => setText(e.target.value)} rows={12} placeholder={t('input.placeholder.string')} /></div>
            <div className="flex items-center gap-4">
              <div className="space-y-1"><Label className="text-xs">{t('input.sentences.string')}</Label><input type="range" min={1} max={10} value={maxSentences} onChange={e => setMaxSentences(parseInt(e.target.value))} className="w-32" /><span className="text-xs text-muted-foreground">{maxSentences}</span></div>
              <Button onClick={handleSummarize} disabled={isLoading || !text} className="ml-auto"><Sparkles className="h-4 w-4 mr-1" /> {isLoading ? t('loading.string') : t('summarize.string')}</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center justify-between">{t('output.title.string')}{summary && (<Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</Button>)}</CardTitle></CardHeader>
          <CardContent>{summary ? <div className="p-4 rounded-md bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap">{summary}</div> : <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p>}</CardContent>
        </Card>
      </div>
    </div>
  )
}
