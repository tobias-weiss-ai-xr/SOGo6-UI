'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useGetBackupHistoryQuery, useTriggerBackupMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { HardDrive, Play, Clock, CheckCircle, XCircle, Database } from 'lucide-react'
import React, { ReactNode } from 'react'
import { toast } from 'sonner'

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

export default function BackupPage(): ReactNode {
  const t = useTranslations('AP_BACKUP')
  const { data, isLoading, refetch } = useGetBackupHistoryQuery()
  const [triggerBackup, { isLoading: triggering }] = useTriggerBackupMutation()

  const entries = data?.entries ?? []
  const config = data?.config

  const handleTrigger = async () => {
    try {
      await triggerBackup().unwrap()
      toast.success(t('trigger.success.string'))
      refetch()
    } catch {
      toast.error(t('trigger.error.string'))
    }
  }

  if (isLoading) {
    return <div className="p-6"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64" /></div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <Button onClick={handleTrigger} disabled={triggering}>
          <Play className="h-4 w-4 mr-1" />
          {triggering ? t('trigger.running.string') : t('trigger.button.string')}
        </Button>
      </div>

      {/* Config summary */}
      {config && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('config.retention.string')}</div>
              <div className="text-xl font-bold">{config.retention_days} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('config.s3.string')}</div>
              <div className="text-xl font-bold">{config.s3_enabled ? '✓' : '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('config.mailstore.string')}</div>
              <div className="text-xl font-bold">{config.include_mailstore ? '✓' : '—'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('config.total.string')}</div>
              <div className="text-xl font-bold">{entries.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left">{t('table.id.string')}</th>
              <th className="px-3 py-2 text-left">{t('table.timestamp.string')}</th>
              <th className="px-3 py-2 text-left">{t('table.type.string')}</th>
              <th className="px-3 py-2 text-left">{t('table.status.string')}</th>
              <th className="px-3 py-2 text-left">{t('table.size.string')}</th>
              <th className="px-3 py-2 text-left">{t('table.duration.string')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted-foreground py-8">{t('table.empty.string')}</td></tr>
            ) : (
              entries.map((entry: any) => (
                <tr key={entry.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">{entry.id}</td>
                  <td className="px-3 py-2 text-muted-foreground">{formatTimestamp(entry.timestamp)}</td>
                  <td className="px-3 py-2">{entry.type}</td>
                  <td className="px-3 py-2">
                    <Badge variant={entry.status === 'completed' ? 'default' : 'destructive'} className={entry.status === 'completed' ? 'bg-green-600' : ''}>
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{entry.size_mb} MB</td>
                  <td className="px-3 py-2">{entry.duration_s}s</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
