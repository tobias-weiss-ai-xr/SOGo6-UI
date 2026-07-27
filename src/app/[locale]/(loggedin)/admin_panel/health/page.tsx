'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetHealthDashboardQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Activity, Database, Server, Clock, RefreshCw } from 'lucide-react'
import React, { ReactNode } from 'react'

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function ServiceIcon({ name }: { name: string }) {
  switch (name) {
    case 'Redis': return <Database className="h-4 w-4" />
    case 'PostgreSQL': return <Database className="h-4 w-4" />
    case 'LDAP': return <Server className="h-4 w-4" />
    default: return <Server className="h-4 w-4" />
  }
}

export default function HealthDashboardPage(): ReactNode {
  const t = useTranslations('AP_HEALTH')
  const { data, isLoading, isError, refetch } = useGetHealthDashboardQuery()

  const health = data?.data ?? null
  const services = health?.services ?? []
  const allOk = services.length > 0 && services.every(s => s.status === 'ok')
  const degraded = services.some(s => s.status !== 'ok')

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          {allOk ? (
            <Badge className="bg-green-600">{t('status.all_ok.string')}</Badge>
          ) : degraded ? (
            <Badge variant="destructive">{t('status.degraded.string')}</Badge>
          ) : null}
        </div>
        <button onClick={() => refetch()} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-muted-foreground text-sm mb-6">{t('description.string')}</p>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('overview.uptime.string')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {formatUptime(health?.uptime_seconds ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('overview.version.string')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.version ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('overview.services.string')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.filter(s => s.status === 'ok').length}/{services.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => (
          <Card key={service.name} className={service.status !== 'ok' ? 'border-destructive/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ServiceIcon name={service.name} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <Badge variant={service.status === 'ok' ? 'default' : 'destructive'} className={
                  service.status === 'ok' ? 'bg-green-600' : ''
                }>
                  {service.status}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>{service.detail}</span>
                <span>{service.latency_ms}ms</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isError && (
        <div className="text-destructive p-4 rounded-md border border-destructive/20 bg-destructive/5 mt-4">
          {t('errors.load_failed.string')}
        </div>
      )}
    </div>
  )
}
