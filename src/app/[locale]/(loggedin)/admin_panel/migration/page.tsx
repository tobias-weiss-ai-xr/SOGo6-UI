'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListUsersQuery, useGetMigrationSourcesQuery, useGetMigrationHistoryQuery, useStartMigrationMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { ArrowRightLeft, Play, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'running': return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    case 'failed': return <XCircle className="h-4 w-4 text-destructive" />
    case 'cancelled': return <AlertCircle className="h-4 w-4 text-yellow-600" />
    default: return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

export default function MigrationPage(): ReactNode {
  const t = useTranslations('AP_MIG')
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  const { data: users = [] } = useListUsersQuery()
  const { data: sourcesData } = useGetMigrationSourcesQuery()
  const { data: historyData, isLoading: historyLoading } = useGetMigrationHistoryQuery()
  const [startMigration, { isLoading: starting }] = useStartMigrationMutation()

  const sources = sourcesData?.sources ?? []
  const entries = historyData?.entries ?? []
  const selectedSourceInfo = sources.find(s => s.id === selectedSource)

  const handleStart = useCallback(async () => {
    if (!selectedSource || !selectedUser) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      await startMigration({ source: selectedSource, user_uid: selectedUser, options: fieldValues }).unwrap()
      toast.success(t('start.success.string'))
      setFieldValues({})
    } catch {
      toast.error(t('start.error.string'))
    }
  }, [selectedSource, selectedUser, fieldValues, startMigration, t])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Migration wizard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> {t('wizard.title.string')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Source selector */}
            <div className="space-y-2">
              <Label>{t('wizard.source.string')}</Label>
              <select value={selectedSource} onChange={(e) => { setSelectedSource(e.target.value); setFieldValues({}) }} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">{t('wizard.select_source.string')}</option>
                {sources.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {selectedSourceInfo && (
                <p className="text-xs text-muted-foreground">{selectedSourceInfo.description}</p>
              )}
            </div>

            {/* User selector */}
            <div className="space-y-2">
              <Label>{t('wizard.user.string')}</Label>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">{t('wizard.select_user.string')}</option>
                {users.map((u: any) => (
                  <option key={u.uid || u.mail} value={u.uid || u.mail}>{u.cn || u.uid} ({u.mail})</option>
                ))}
              </select>
            </div>

            {/* Source-specific fields */}
            {selectedSourceInfo?.fields.map(field => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">{field.replace(/_/g, ' ')}</Label>
                <Input
                  value={fieldValues[field] || ''}
                  onChange={(e) => setFieldValues(prev => ({ ...prev, [field]: e.target.value }))}
                  placeholder={field}
                  type={field.includes('password') || field.includes('secret') || field.includes('token') ? 'password' : 'text'}
                />
              </div>
            ))}

            <Button onClick={handleStart} disabled={!selectedSource || !selectedUser || starting}>
              <Play className="h-4 w-4 mr-1" />
              {starting ? t('start.running.string') : t('start.button.string')}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('history.title.string')}</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-40" />
            ) : entries.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">{t('history.empty.string')}</div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry: any) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-md border">
                    <StatusIcon status={entry.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{entry.source}</span>
                        <Badge variant="outline" className="text-xs">{entry.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.user_uid} · {entry.items_migrated} migrated</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(entry.started_at)}</p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{entry.id}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
