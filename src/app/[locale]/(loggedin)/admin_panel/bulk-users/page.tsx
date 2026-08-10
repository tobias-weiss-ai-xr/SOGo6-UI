'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useExportUsersCsvMutation, useImportUsersCsvMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Upload, Download, FileSpreadsheet, Users, AlertCircle } from 'lucide-react'
import React, { ReactNode, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function BulkUsersPage(): ReactNode {
  const t = useTranslations('AP_BULK')
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)

  const [exportCsv, { isLoading: exportLoading }] = useExportUsersCsvMutation()
  const [importCsv, { isLoading: importLoading }] = useImportUsersCsvMutation()

  const handleExport = async () => {
    try {
      const blob = await exportCsv().unwrap()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users-export.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('export.success.string'))
    } catch {
      toast.error(t('export.error.string'))
    }
  }

  const handleImport = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const result = await importCsv(formData).unwrap()
      const data = (result as any)?.data ?? result
      toast.success(
        t('import.success.string', { created: data.created ?? 0, updated: data.updated ?? 0 })
      )
      if (data.errors?.length > 0) {
        toast.warning(`${data.errors.length} rows had errors`)
      }
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      toast.error(t('import.error.string'))
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" /> {t('export.title.string')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('export.description.string')}</p>
            <div className="rounded-md bg-muted p-4 text-center">
              <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('export.format.string')}</p>
            </div>
            <Button onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? <Download className="h-4 w-4 mr-2 animate-pulse" /> : <Download className="h-4 w-4 mr-2" />}
              {t('export.button.string')}
            </Button>
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
            <p className="text-sm text-muted-foreground">{t('import.description.string')}</p>
            <div className="rounded-md border-2 border-dashed p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="text-xs text-destructive hover:underline">
                    {t('import.remove.string')}
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-2 mx-auto text-muted-foreground hover:text-foreground">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm">{t('import.dropzone.string')}</p>
                </button>
              )}
            </div>
            <Button onClick={handleImport} disabled={!file || importLoading}>
              {importLoading ? <Upload className="h-4 w-4 mr-2 animate-pulse" /> : <Upload className="h-4 w-4 mr-2" />}
              {t('import.button.string')}
            </Button>
          </CardContent>
        </Card>

        {/* CSV format hint */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {t('format.title.string')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted p-4">
              <code className="text-xs">uid,cn,sn,givenName,mail,password</code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('format.hint.string')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
