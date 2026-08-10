'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiDetectAnomalyMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { ShieldAlert, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function AiAnomalyPage(): ReactNode {
  const t = useTranslations('AI_ANOMALY')
  const [recipientCount, setRecipientCount] = useState('5')
  const [hour, setHour] = useState('14')
  const [newRecipientRatio, setNewRecipientRatio] = useState('0.1')
  const [result, setResult] = useState<any>(null)
  const [detect, { isLoading }] = useAiDetectAnomalyMutation()
  const handleDetect = useCallback(async () => {
    try { const r = await detect({ recipient_count: parseInt(recipientCount), hour: parseInt(hour), new_recipient_ratio: parseFloat(newRecipientRatio) }).unwrap(); setResult(r) }
    catch { toast.error(t('errors.fail.string')) }
  }, [recipientCount, hour, newRecipientRatio, detect, t])
  const score = result?.score ?? 0
  const isAnomaly = result?.is_anomaly ?? false
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label>{t('input.recipients.string')}</Label><Input type="number" value={recipientCount} onChange={e => setRecipientCount(e.target.value)} /></div><div className="space-y-2"><Label>{t('input.hour.string')}</Label><Input type="number" value={hour} onChange={e => setHour(e.target.value)} min={0} max={23} /></div><div className="space-y-2"><Label>{t('input.new_ratio.string')}</Label><Input type="number" step="0.1" value={newRecipientRatio} onChange={e => setNewRecipientRatio(e.target.value)} min={0} max={1} /></div></div><Button onClick={handleDetect} disabled={isLoading} className="ml-auto"><Sparkles className="h-4 w-4 mr-1" /> {t('analyze.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('output.title.string')}</CardTitle></CardHeader><CardContent>{!result ? <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p> : (<div className="space-y-4"><div className={`flex items-center gap-3 p-4 rounded-md border-2 ${isAnomaly ? 'border-destructive' : 'border-green-600'}`}>{isAnomaly ? <AlertTriangle className="h-8 w-8 text-destructive" /> : <CheckCircle2 className="h-8 w-8 text-green-600" />}<div><p className="font-medium">{isAnomaly ? t('output.anomaly.string') : t('output.normal.string')}</p><p className="text-sm text-muted-foreground">{t('output.score.string')}: {Math.round(score * 100)}%</p></div></div>{(result.flags || []).length > 0 && (<div className="flex flex-wrap gap-2">{(result.flags as string[]).map((flag, i) => (<Badge key={i} variant="destructive" className="text-xs">{flag}</Badge>))}</div>)}</div>)}</CardContent></Card>
      </div>
    </div>
  )
}
