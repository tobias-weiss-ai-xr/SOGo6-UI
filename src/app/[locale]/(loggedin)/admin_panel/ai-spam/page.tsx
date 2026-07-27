'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiSpamScoreMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function AiSpamPage(): ReactNode {
  const t = useTranslations('AI_SPAM')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sender, setSender] = useState('')
  const [result, setResult] = useState<any>(null)

  const [spamScore, { isLoading }] = useAiSpamScoreMutation()

  const handleScore = useCallback(async () => {
    if (!subject && !body) { toast.error(t('errors.empty.string')); return }
    try {
      const res = await spamScore({ subject: subject || '(no subject)', body: body || '', sender }).unwrap()
      setResult(res)
    } catch { toast.error(t('errors.fail.string')) }
  }, [subject, body, sender, spamScore, t])

  const score = result?.score ?? 0
  const scoreColor = score >= 5 ? 'text-destructive' : score >= 3.5 ? 'text-yellow-600' : 'text-green-600'
  const scoreBg = score >= 5 ? 'border-destructive' : score >= 3.5 ? 'border-yellow-600' : 'border-green-600'

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> {t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>{t('input.subject.string')}</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('input.sender.string')}</Label><Input value={sender} onChange={e => setSender(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('input.body.string')}</Label><Textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder={t('input.placeholder.string')} /></div>
            <Button onClick={handleScore} disabled={isLoading} className="ml-auto"><Sparkles className="h-4 w-4 mr-1" /> {t('score.string')}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t('output.title.string')}</CardTitle></CardHeader>
          <CardContent>
            {!result ? <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p> : (
              <div className="space-y-4">
                <div className={`flex items-center gap-4 p-4 rounded-md border-2 ${scoreBg}`}>
                  <div className={`h-10 w-10 ${scoreColor}`}>
                    {score >= 5 ? <XCircle className="h-10 w-10" /> : score >= 3.5 ? <MinusCircle className="h-10 w-10" /> : <CheckCircle2 className="h-10 w-10" />}
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${scoreColor}`}>{score}/10</p>
                    <Badge variant={result.is_spam ? 'destructive' : result.is_suspicious ? 'secondary' : 'default'} className={result.is_spam ? '' : result.is_suspicious ? 'bg-yellow-600' : 'bg-green-600'}>{result.classification}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">{t('output.signals.string')}</p>
                  <div className="space-y-1">
                    {(result.signals || []).map((sig: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-16">{sig.type}</span>
                        <Badge variant="outline" className="text-xs">{sig.signal}</Badge>
                        <span className="ml-auto">x{sig.weight?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
