'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetJmapStatusQuery, useGetActiveSyncStatusQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Mail, Smartphone } from 'lucide-react'
import React, { ReactNode } from 'react'
export default function ProtocolsPage(): ReactNode {
  const t = useTranslations('PROTOCOLS')
  const { data: jmapData } = useGetJmapStatusQuery()
  const jmap = (jmapData as any)?.data ?? {}
  const { data: easData } = useGetActiveSyncStatusQuery()
  const eas = (easData as any)?.data ?? {}
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-blue-500" /> JMAP (RFC 8620/8621)</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-2"><Badge variant={jmap.enabled ? 'default' : 'secondary'}>{jmap.enabled ? 'Active' : 'Inactive'}</Badge><span className="text-sm text-muted-foreground">{jmap.version ?? ''}</span></div><div className="p-3 rounded bg-muted/50 text-sm space-y-2"><div className="flex justify-between"><span className="text-muted-foreground">Max concurrent requests:</span><span className="font-mono">{jmap.max_requests ?? '-'}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Max upload size:</span><span className="font-mono">{jmap.max_upload ? `${(jmap.max_upload / 1048576).toFixed(0)} MB` : '-'}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Session endpoint:</span><code className="text-xs">/jmap/session</code></div><div className="flex justify-between"><span className="text-muted-foreground">API endpoint:</span><code className="text-xs">/jmap</code></div></div><div><p className="text-xs font-medium mb-1">Capabilities:</p><div className="flex flex-wrap gap-1">{(jmap.capabilities ?? []).map((c: string, i: number) => (<Badge key={i} variant="outline" className="text-xs">{c}</Badge>))}</div></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4 text-green-500" /> ActiveSync (EAS 16.1)</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-2"><Badge variant={eas.enabled ? 'default' : 'secondary'}>{eas.enabled ? 'Active' : 'Inactive'}</Badge><span className="text-sm text-muted-foreground">v{eas.protocol_version ?? ''}</span></div><div className="p-3 rounded bg-muted/50 text-sm space-y-2"><div className="flex justify-between"><span className="text-muted-foreground">Provisioned devices:</span><span className="font-mono">{eas.provisioned_devices ?? 0}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Endpoint:</span><code className="text-xs">/Microsoft-Server-ActiveSync</code></div></div><div><p className="text-xs font-medium mb-1">Commands:</p><div className="flex flex-wrap gap-1">{(eas.supported_commands ?? []).map((c: string, i: number) => (<Badge key={i} variant="outline" className="text-xs">{c}</Badge>))}</div></div><div><p className="text-xs font-medium mb-1">Policies:</p><div className="flex flex-wrap gap-1">{(eas.policies ?? []).map((p: string, i: number) => (<Badge key={i} variant="outline" className="text-xs">{p}</Badge>))}</div></div></CardContent></Card>
      </div>
    </div>
  )
}
