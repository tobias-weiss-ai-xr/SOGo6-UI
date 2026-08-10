'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListFileSharesQuery, useCreateFileShareMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Share2, Plus, X, Copy, Check, Download, Lock, Clock } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() / 1000 - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function FileSharingPage(): ReactNode {
  const t = useTranslations('AP_FILESHARE')
  const [showCreate, setShowCreate] = useState(false)
  const [filename, setFilename] = useState('')
  const [size, setSize] = useState('')
  const [expiresIn, setExpiresIn] = useState('7')
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const { data, isLoading } = useListFileSharesQuery()
  const [createShare, { isLoading: creating }] = useCreateFileShareMutation()

  const shares = data ?? []

  const handleCreate = useCallback(async () => {
    if (!filename || !size) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      await createShare({
        filename,
        size: parseInt(size),
        expires_in_days: parseInt(expiresIn),
        password,
      }).unwrap()
      toast.success(t('create.success.string'))
      setFilename(''); setSize(''); setPassword('')
      setShowCreate(false)
    } catch {
      toast.error(t('create.error.string'))
    }
  }, [filename, size, expiresIn, password, createShare, t])

  const handleCopy = useCallback((url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} variant={showCreate ? 'outline' : 'default'}>
          {showCreate ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreate ? t('form.cancel.string') : t('form.share.string')}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">{t('form.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('form.filename.string')}</Label>
                <Input value={filename} onChange={e => setFilename(e.target.value)} placeholder="report.pdf" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>{t('form.size.string')}</Label>
                  <Input type="number" value={size} onChange={e => setSize(e.target.value)} placeholder="bytes" />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.expires.string')}</Label>
                  <Input type="number" value={expiresIn} onChange={e => setExpiresIn(e.target.value)} min={1} max={90} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('form.password.string')}</Label>
              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder={t('form.password_hint.string')} />
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              <Share2 className="h-4 w-4 mr-1" /> {t('form.submit.string')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : shares.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t('list.empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map((share: any) => (
            <Card key={share.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-4 w-4 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{share.filename}</span>
                        {share.password && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{formatBytes(share.size)}</span>
                        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {share.downloads ?? 0}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(share.created_at)}</span>
                        <span>exp: {share.expires_in_days ?? 7}d</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(share.url, share.id)}>
                    {copied === share.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
