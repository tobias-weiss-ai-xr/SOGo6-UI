'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLazyGetMailboxDebugRawQuery, useLazyGetMailboxDebugHeadersQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useListUsersQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Bug, FileCode, AtSign, RefreshCw } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function DebugPage(): ReactNode {
  const t = useTranslations('AP_DEBUG')
  const [userUid, setUserUid] = useState('')
  const [folder, setFolder] = useState('INBOX')
  const [mailUid, setMailUid] = useState('')
  const [rawResult, setRawResult] = useState<string | null>(null)
  const [headersResult, setHeadersResult] = useState<Record<string, string> | null>(null)
  const [view, setView] = useState<'raw' | 'headers'>('raw')

  const { data: users = [] } = useListUsersQuery()
  const [fetchRaw, { isLoading: rawLoading }] = useLazyGetMailboxDebugRawQuery()
  const [fetchHeaders, { isLoading: headersLoading }] = useLazyGetMailboxDebugHeadersQuery()

  const handleDebug = useCallback(async () => {
    if (!userUid || !folder || !mailUid) {
      toast.error(t('errors.fields_required.string'))
      return
    }
    if (view === 'raw') {
      try {
        const res = await fetchRaw({ userUid, folder, mailUid }).unwrap()
        setRawResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2))
        setHeadersResult(null)
      } catch { toast.error(t('errors.fetch_failed.string')) }
    } else {
      try {
        const res = await fetchHeaders({ userUid, folder, mailUid }).unwrap()
        setHeadersResult(typeof res === 'object' && res ? res as Record<string, string> : null)
        setRawResult(null)
      } catch { toast.error(t('errors.fetch_failed.string')) }
    }
  }, [userUid, folder, mailUid, view, fetchRaw, fetchHeaders, t])

  const loading = rawLoading || headersLoading

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>

      {/* Input form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="h-4 w-4" /> {t('query.title.string')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t('labels.user.string')}</Label>
              <select value={userUid} onChange={(e) => setUserUid(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">{t('labels.select_user.string')}</option>
                {users.map((u: any) => (
                  <option key={u.uid || u.mail} value={u.uid || u.mail}>{u.mail || u.uid}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t('labels.folder.string')}</Label>
              <Input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="INBOX" />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.mail_uid.string')}</Label>
              <Input value={mailUid} onChange={(e) => setMailUid(e.target.value)} placeholder="12345" />
            </div>
            <div className="flex items-end gap-2">
              <Button variant={view === 'raw' ? 'default' : 'outline'} size="sm" onClick={() => setView('raw')}>
                <FileCode className="h-4 w-4 mr-1" /> Raw
              </Button>
              <Button variant={view === 'headers' ? 'default' : 'outline'} size="sm" onClick={() => setView('headers')}>
                <AtSign className="h-4 w-4 mr-1" /> Headers
              </Button>
              <Button onClick={handleDebug} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Bug className="h-4 w-4 mr-1" />}
                {t('query.button.string')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {rawResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode className="h-4 w-4" /> {t('result.raw.title.string')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-[500px] whitespace-pre-wrap break-all">
              {rawResult}
            </pre>
          </CardContent>
        </Card>
      )}

      {headersResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AtSign className="h-4 w-4" /> {t('result.headers.title.string')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(headersResult).map(([key, val]) => (
                    <tr key={key} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono font-medium bg-muted/50 w-1/3">{key}</td>
                      <td className="px-3 py-2 font-mono">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
