'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiClassifyAttachmentMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { FileText, Sparkles, Eye, Archive, Calendar, UserPlus, Code } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
const ICON_MAP: Record<string, any> = { document: FileText, spreadsheet: FileText, presentation: FileText, image: FileText, archive: Archive, calendar: Calendar, contact: UserPlus, code: Code }
export default function AiAttachmentPage(): ReactNode {
  const t = useTranslations('AI_ATTACH')
  const [filename, setFilename] = useState('')
  const [result, setResult] = useState<{ type: string; suggestion: string; can_preview: boolean } | null>(null)
  const [classify, { isLoading }] = useAiClassifyAttachmentMutation()
  const handleClassify = useCallback(async () => {
    if (!filename) { toast.error(t('errors.empty.string')); return }
    try { const r = await classify({ filename }).unwrap(); setResult(r) }
    catch { toast.error(t('errors.fail.string')) }
  }, [filename, classify, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">{t('input.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>{t('input.filename.string')}</Label><Input value={filename} onChange={e => setFilename(e.target.value)} placeholder="report-q4-2024.pdf" onKeyDown={e => e.key === 'Enter' && handleClassify()} /></div><Button onClick={handleClassify} disabled={isLoading || !filename} className="ml-auto"><Sparkles className="h-4 w-4 mr-1" /> {t('classify.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('output.title.string')}</CardTitle></CardHeader><CardContent>{!result ? <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p> : (<div className="space-y-3"><div className="flex items-center gap-3 p-3 rounded-md bg-muted/50"><FileText className="h-5 w-5 text-primary" /><div><Badge variant="outline" className="capitalize">{result.type}</Badge><p className="text-sm mt-1">{result.suggestion}</p></div></div>{result.can_preview && <Badge className="bg-green-600"><Eye className="h-3 w-3 mr-1" /> {t('output.preview.string')}</Badge>}</div>)}</CardContent></Card>
      </div>
    </div>
  )
}
