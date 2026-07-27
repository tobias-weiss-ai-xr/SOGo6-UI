'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetConfigExportQuery, useGetConfigHistoryQuery, useImportConfigMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { GitBranch, Download, Upload, RefreshCw, Copy, Check, Clock } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

export default function ConfigCodePage(): ReactNode {
  const t = useTranslations('AP_CFGCODE')
  const [importJson, setImportJson] = useState('')
  const [description, setDescription] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: exportData, isLoading: exportLoading, refetch: refetchExport } = useGetConfigExportQuery()
  const { data: historyData } = useGetConfigHistoryQuery()
  const [importConfig, { isLoading: importing }] = useImportConfigMutation()

  const snapshots = historyData?.snapshots ?? []
  const configJson = exportData ? JSON.stringify(exportData.config, null, 2) : '{}'

  const handleExport = useCallback(() => {
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sogo6-config-v${exportData?.version ?? 0}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('export.success.string'))
  }, [configJson, exportData, t])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(configJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [configJson])

  const handleImport = useCallback(async () => {
    if (!importJson.trim()) {
      toast.error(t('errors.empty.string'))
      return
    }
    try {
      const parsed = JSON.parse(importJson)
      await importConfig({ config: parsed, description: description || undefined }).unwrap()
      toast.success(t('import.success.string'))
      setImportJson('')
      setDescription('')
      refetchExport()
    } catch (e) {
      toast.error(t('errors.parse.string'))
    }
  }, [importJson, description, importConfig, refetchExport, t])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>

      {/* Current config info */}
      {exportData && (
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="outline" className="gap-1"><GitBranch className="h-3 w-3" /> v{exportData.version}</Badge>
          <span className="text-sm text-muted-foreground">sha:{exportData.checksum}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" /> {t('export.title.string')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exportLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <>
                <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-[400px] whitespace-pre-wrap break-all font-mono">
                  {configJson}
                </pre>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? t('export.copied.string') : t('export.copy.string')}
                  </Button>
                  <Button size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1" /> {t('export.download.string')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" /> {t('import.title.string')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('import.description_label.string')}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('import.description_placeholder.string')}
              />
            </div>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={12}
              placeholder={t('import.placeholder.string')}
              className="w-full rounded-md border px-3 py-2 text-xs font-mono"
            />
            <Button onClick={handleImport} disabled={!importJson.trim() || importing}>
              <Upload className="h-4 w-4 mr-1" />
              {importing ? t('import.running.string') : t('import.button.string')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{t('history.title.string')}</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">{t('history.empty.string')}</div>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snap: any) => (
                <div key={snap.id} className="flex items-center gap-3 p-3 rounded-md border">
                  <GitBranch className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">v{snap.version}</span>
                      <span className="text-xs text-muted-foreground">sha:{snap.checksum}</span>
                    </div>
                    {snap.description && <p className="text-xs text-muted-foreground">{snap.description}</p>}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{snap.created_by}</div>
                    <div>{formatTimestamp(snap.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
