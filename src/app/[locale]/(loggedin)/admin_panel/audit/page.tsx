'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useGetAuditLogQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { RefreshCw, Shield, ScrollText } from 'lucide-react'
import React, { ReactNode } from 'react'

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

function ActionBadge({ action }: { action: string }) {
  const color = action.includes('delete') || action.includes('remove')
    ? 'destructive'
    : action.includes('create') || action.includes('add')
      ? 'default'
      : 'secondary'
  return <Badge variant={color}>{action}</Badge>
}

export default function AuditLogPage(): ReactNode {
  const t = useTranslations('AP_AUDIT')
  const { data, isLoading, isError, refetch } = useGetAuditLogQuery({ limit: 100 })

  const entries = data?.entries ?? []

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <button onClick={() => refetch()} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.timestamp.string')}</TableHead>
              <TableHead>{t('table.action.string')}</TableHead>
              <TableHead>{t('table.actor.string')}</TableHead>
              <TableHead>{t('table.target.string')}</TableHead>
              <TableHead>{t('table.detail.string')}</TableHead>
              <TableHead>{t('table.ip.string')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {t('table.no_entries.string')}
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry: { timestamp: number; action: string; actor: string; target: string | null; detail: string | null; ip: string | null }, i: number) => (
                <TableRow key={i}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </TableCell>
                  <TableCell><ActionBadge action={entry.action} /></TableCell>
                  <TableCell className="font-medium">{entry.actor}</TableCell>
                  <TableCell className="text-sm">{entry.target || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {entry.detail || '—'}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {entry.ip || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        {entries.length} {entries.length === 1 ? t('count_one.string') : t('count_many.string')}
      </div>

      {isError && (
        <div className="text-destructive p-4 rounded-md border border-destructive/20 bg-destructive/5 mt-4">
          {t('errors.load_failed.string')}
        </div>
      )}
    </div>
  )
}
