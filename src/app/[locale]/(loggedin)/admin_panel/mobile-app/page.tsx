'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useListMobileDevicesQuery, useGetMobileConfigQuery, useSetMobileConfigMutation, useUnregisterMobileDeviceMutation, useBroadcastPushMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Smartphone, Trash2, Send, Settings } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function MobileAppPage(): ReactNode {
  const t = useTranslations('MOBILE')
  const [pushTitle, setPushTitle] = useState('')
  const [pushMsg, setPushMsg] = useState('')
  const { data: devicesData, refetch } = useListMobileDevicesQuery(undefined, { pollingInterval: 15000 })
  const { data: configData, refetch: refetchConfig } = useGetMobileConfigQuery()
  const [setMobileConfig] = useSetMobileConfigMutation()
  const [unregister] = useUnregisterMobileDeviceMutation()
  const [broadcast, { isLoading: broadcasting }] = useBroadcastPushMutation()
  const devices = (devicesData as any)?.data ?? []
  const config = (configData as any)?.data ?? {}
  const handleToggle = useCallback(async (key: string, value: boolean) => {
    try { await setMobileConfig({ ...config, [key]: value }).unwrap(); refetchConfig() } catch { toast.error(t('errors.fail.string')) }
  }, [config, setMobileConfig, refetchConfig, t])
  const handleUnregister = useCallback(async (id: string) => {
    try { await unregister(id).unwrap(); refetch(); toast.success(t('success.unregister.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [unregister, refetch, t])
  const handleBroadcast = useCallback(async () => {
    if (!pushMsg) return
    try { await broadcast({ title: pushTitle || 'SOGo', message: pushMsg }).unwrap(); setPushTitle(''); setPushMsg(''); toast.success(t('success.broadcast.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [pushTitle, pushMsg, broadcast, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> {t('config.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4">{[
            { key: 'push_enabled', label: t('config.push.string') },
            { key: 'biometric_enabled', label: t('config.biometric.string') },
          ].map(item => (<div key={item.key} className="flex items-center justify-between"><span className="text-sm">{item.label}</span><Switch checked={!!config[item.key]} onCheckedChange={v => handleToggle(item.key, v)} /></div>))}<div className="text-xs text-muted-foreground space-y-1"><div>App: <span className="font-medium">{config.app_name ?? 'SOGo Mail'}</span> v{config.latest_version ?? '-'}</div><div>Min version: {config.min_version ?? '-'}</div></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('push.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={pushTitle} onChange={e => setPushTitle(e.target.value)} placeholder={t('push.title.placeholder.string')} /><Input value={pushMsg} onChange={e => setPushMsg(e.target.value)} placeholder={t('push.message.placeholder.string')} /><Button onClick={handleBroadcast} disabled={broadcasting || !pushMsg} className="w-full"><Send className="h-4 w-4 mr-1" /> {t('push.broadcast.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('stats.title.string')}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">{devices.length}</p><p className="text-xs text-muted-foreground">{t('stats.devices.string')}</p></div><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">{devices.filter((d: any) => d.platform === 'ios').length}</p><p className="text-xs text-muted-foreground">iOS</p></div><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">{devices.filter((d: any) => d.platform === 'android').length}</p><p className="text-xs text-muted-foreground">Android</p></div></CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">{t('devices.title.string')}<Badge variant="outline" className="ml-2">{devices.length}</Badge></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Platform</TableHead><TableHead>Device</TableHead><TableHead>App Version</TableHead><TableHead>Last Seen</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{devices.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t('devices.empty.string')}</TableCell></TableRow> : devices.map((d: any) => (<TableRow key={d.id}><TableCell className="font-medium">{d.user_email}</TableCell><TableCell><Badge variant={d.platform === 'ios' ? 'default' : 'secondary'} className={d.platform === 'ios' ? 'bg-blue-600' : d.platform === 'android' ? 'bg-green-600' : ''}>{d.platform ?? '?'}</Badge></TableCell><TableCell className="text-sm">{d.device_model ?? '-'}</TableCell><TableCell className="text-xs font-mono">{d.app_version ?? '-'}</TableCell><TableCell className="text-xs text-muted-foreground">{d.last_seen ? new Date(d.last_seen * 1000).toLocaleString() : '-'}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => handleUnregister(d.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}
