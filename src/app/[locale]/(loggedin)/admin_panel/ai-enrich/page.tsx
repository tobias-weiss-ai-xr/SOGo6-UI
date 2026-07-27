'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiEnrichContactMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { UserCircle, Sparkles, Phone, Building2, MapPin, Briefcase } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function AiEnrichPage(): ReactNode {
  const t = useTranslations('AI_ENRICH')
  const [text, setText] = useState('')
  const [result, setResult] = useState<Record<string, string>>({})
  const [enrich, { isLoading }] = useAiEnrichContactMutation()
  const handleEnrich = useCallback(async () => {
    if (!text) { toast.error(t('errors.empty.string')); return }
    try { const r = await enrich({ text }).unwrap(); setResult(r) }
    catch { toast.error(t('errors.fail.string')) }
  }, [text, enrich, t])
  const fields = [
    { key: 'phone', icon: Phone, label: t('field.phone.string') },
    { key: 'title', icon: Briefcase, label: t('field.title.string') },
    { key: 'company', icon: Building2, label: t('field.company.string') },
    { key: 'location', icon: MapPin, label: t('field.location.string') },
  ]
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>{t('input.signature.string')}</Label><Textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder={t('input.placeholder.string')} /></div><Button onClick={handleEnrich} disabled={isLoading || !text} className="ml-auto"><Sparkles className="h-4 w-4 mr-1" /> {t('extract.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('output.title.string')}</CardTitle></CardHeader><CardContent>{Object.keys(result).length > 0 ? (<div className="space-y-3">{fields.map(({ key, icon: Icon, label }) => result[key] && (<div key={key} className="flex items-center gap-3 p-3 rounded-md bg-muted/50"><Icon className="h-4 w-4 text-primary" /><span className="text-sm text-muted-foreground w-20">{label}</span><span className="font-medium text-sm">{result[key]}</span></div>))}</div>) : <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p>}</CardContent></Card>
      </div>
    </div>
  )
}
