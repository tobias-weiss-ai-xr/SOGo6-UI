'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { FileText, Upload, Eye, X, Settings } from 'lucide-react'
import React, { ReactNode, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

const SUPPORTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation']

export default function DocumentPreviewPage(): ReactNode {
  const t = useTranslations('AP_DOCPREV')
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [collaboraUrl, setCollaboraUrl] = useState('https://collabora.example.org')
  const [showSettings, setShowSettings] = useState(false)

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.type === 'application/pdf') {
      const url = URL.createObjectURL(f)
      setPreviewUrl(url)
      setFile(f)
    } else if (f.type.startsWith('application/vnd.')) {
      const encodedName = encodeURIComponent(f.name)
      const url = `${collaboraUrl}/browser/${encodedName}?host=${encodeURIComponent(window.location.origin)}`
      setPreviewUrl(url)
      setFile(f)
    } else {
      toast.error(t('errors.unsupported.string'))
    }
  }, [collaboraUrl, t])

  const clearPreview = useCallback(() => {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null); setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [previewUrl])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-1" /> {t('settings.button.string')}
          </Button>
        </div>
      </div>

      {/* Collabora URL config */}
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t('settings.title.string')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-md">
              <Label>{t('settings.collabora_url.string')}</Label>
              <Input value={collaboraUrl} onChange={(e) => setCollaboraUrl(e.target.value)} placeholder="https://collabora.example.org" />
              <p className="text-xs text-muted-foreground">{t('settings.hint.string')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload area */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.pptx" onChange={handleUpload} className="hidden" />
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-3 py-10 rounded-md border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('upload.dropzone.string')}</p>
            <p className="text-xs text-muted-foreground">.pdf, .docx, .xlsx, .pptx</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewUrl && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" /> {file?.name ?? 'Preview'}
              <Badge variant="outline">{file?.type?.split('/').pop()}</Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearPreview}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden" style={{ height: '600px' }}>
              {file?.type === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-full" title="PDF Preview" />
              ) : (
                <iframe src={previewUrl} className="w-full h-full" title="Document Preview" />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
