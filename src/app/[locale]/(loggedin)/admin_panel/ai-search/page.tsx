'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiNaturalSearchMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Search, Sparkles, ArrowRight } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function AiSearchPage(): ReactNode {
  const t = useTranslations('AI_SEARCH')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<{ query: string; filters: Record<string, any> } | null>(null)
  const [nlSearch, { isLoading }] = useAiNaturalSearchMutation()
  const handleSearch = useCallback(async () => {
    if (!query) { toast.error(t('errors.empty.string')); return }
    try { const r = await nlSearch({ query }).unwrap(); setResult(r) }
    catch { toast.error(t('errors.fail.string')) }
  }, [query, nlSearch, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <Card className="mb-6"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex-1"><Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder={t('input.placeholder.string')} className="text-lg h-12" /></div><Button onClick={handleSearch} disabled={isLoading} size="lg"><Sparkles className="h-4 w-4 mr-1" /> {t('search.string')}</Button></div></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">{t('output.title.string')}</CardTitle></CardHeader><CardContent>{!result ? <p className="text-muted-foreground text-sm">{t('output.empty.string')}</p> : (<div className="space-y-3"><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">{t('output.detected.string')}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><code className="text-sm bg-muted px-2 py-1 rounded">{JSON.stringify(result.filters)}</code></div><div className="flex flex-wrap gap-2">{Object.entries(result.filters).map(([key, value]) => (<Badge key={key} variant="outline" className="text-sm">{key}: {String(value)}</Badge>))}</div></div>)}</CardContent></Card>
    </div>
  )
}
