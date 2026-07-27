'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetDbMigrationQuery, useRunDbMigrationMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Database, Play, GitCommit, RefreshCw } from 'lucide-react'
import React, { ReactNode } from 'react'
import { toast } from 'sonner'

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

export default function DbMigrationPage(): ReactNode {
  const t = useTranslations('AP_DBMIG')
  const { data, isLoading, refetch } = useGetDbMigrationQuery()
  const [runMigration, { isLoading: running }] = useRunDbMigrationMutation()

  const version = data?.current_version ?? '—'
  const migrations = data?.migrations ?? []

  const handleRun = async () => {
    try {
      await runMigration().unwrap()
      toast.success(t('run.success.string'))
      refetch()
    } catch {
      toast.error(t('run.error.string'))
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
        <Button onClick={handleRun} disabled={running}>
          <Play className="h-4 w-4 mr-1" />
          {running ? t('run.running.string') : t('run.button.string')}
        </Button>
      </div>

      {/* Current version */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">{t('current_version.string')}</div>
              <div className="text-2xl font-bold font-mono">{version}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitCommit className="h-4 w-4" /> {t('history.title.string')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {migrations.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">{t('history.empty.string')}</div>
            ) : (
              migrations.map((m: any, i: number) => (
                <div key={m.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="flex flex-col items-center mt-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {i < migrations.length - 1 && <div className="w-px h-full min-h-[24px] bg-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{m.version}</span>
                      <Badge variant="outline" className="text-xs">{m.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(m.applied_at)} · {m.applied_by}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
