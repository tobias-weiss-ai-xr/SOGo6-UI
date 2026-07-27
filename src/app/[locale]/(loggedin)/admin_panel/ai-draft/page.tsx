'use client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiSuggestReplyMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { PenTool, Copy, Check, Sparkles } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
const TONES = ['professional', 'friendly', 'formal']
export default function AiDraftPage(): ReactNode {
  const t = useTranslations('AI_DRAFT')
  const [emailText, setEmailText] = useState('')
  const [tone, setTone] = useState('professional')
  const [suggestion, setSuggestion] = useState('')
  const [copied, setCopied] = useState(false)
  const [suggestReply, { isLoading }] = useAiSuggestReplyMutation()
  const handleSuggest = useCallback(async () => {
    if (!emailText) { toast.error(t('errors.empty.string')); return }
    try { const r = await suggestReply({ email_text: emailText, tone }).unwrap(); setSuggestion(r.suggestion ?? '') }
    catch { toast.error(t('errors.fail.string')) }
  }, [emailText, tone, suggestReply, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><PenTool className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>{t('input.email.string')}</Label><Textarea value={emailText} onChange={e => setEmailText(e.target.value)} rows={10} placeholder={t('input.placeholder.string')} /></div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">{TONES.map(t => (<button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${tone === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>{t}</button>))}</div>
              <Button onClick={handleSuggest} disabled={isLoading || !emailText}><Sparkles className="h-4 w-4 mr-1" /> {t('suggest.string')}</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center justify-between">{t('output.title.string')}{suggestion && (<Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(suggestion); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</Button>)}</CardTitle></CardHeader>
          <CardContent>{suggestion ? <div className="p-4 rounded-md bg-muted/50 text-sm leading-relaxed whitespace-pre-wrap">{suggestion}</div> : <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p>}</CardContent>
        </Card>
      </div>
    </div>
  )
}
