'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetMatrixConfigQuery, useSetMatrixConfigMutation, useListMatrixRoomsQuery, useCreateMatrixRoomMutation, useListMatrixLinksQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { MessageSquare, Plus, Settings, Link } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function MatrixChatPage(): ReactNode {
  const t = useTranslations('MATRIX')
  const [homeserver, setHomeserver] = useState('')
  const [roomName, setRoomName] = useState('')
  const [roomVisibility, setRoomVisibility] = useState('private')
  const { data: configData, refetch: refetchConfig } = useGetMatrixConfigQuery()
  const config = (configData as any)?.data ?? {}
  const { data: roomsData, refetch: refetchRooms } = useListMatrixRoomsQuery()
  const { data: linksData } = useListMatrixLinksQuery()
  const rooms = (roomsData as any)?.data ?? []
  const links = (linksData as any)?.data ?? []
  const [setMatrixConfig, { isLoading: saving }] = useSetMatrixConfigMutation()
  const [createRoom, { isLoading: creating }] = useCreateMatrixRoomMutation()
  const handleConfig = useCallback(async () => {
    if (!homeserver) return
    try { await setMatrixConfig({ homeserver, enabled: true }).unwrap(); refetchConfig(); toast.success(t('success.config.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [homeserver, setMatrixConfig, refetchConfig, t])
  const handleCreateRoom = useCallback(async () => {
    if (!roomName) { toast.error(t('errors.name.string')); return }
    try { await createRoom({ name: roomName, visibility: roomVisibility }).unwrap(); setRoomName(''); refetchRooms(); toast.success(t('success.room.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [roomName, roomVisibility, createRoom, refetchRooms, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> {t('config.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><span className="text-sm">{t('config.enabled.string')}</span><Badge variant={config.enabled ? 'default' : 'secondary'}>{config.enabled ? 'ON' : 'OFF'}</Badge></div><div className="flex items-center justify-between"><span className="text-sm">{t('config.bridge.string')}</span><Badge variant={config.bridge_enabled ? 'default' : 'secondary'}>{config.bridge_enabled ? 'ON' : 'OFF'}</Badge></div><Input value={homeserver} onChange={e => setHomeserver(e.target.value)} placeholder={config.homeserver || 'https://matrix.org'} /><Button onClick={handleConfig} disabled={saving || !homeserver} className="w-full">{t('button.save.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('rooms.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder={t('rooms.name.placeholder.string')} /><select value={roomVisibility} onChange={e => setRoomVisibility(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm"><option value="private">{t('rooms.visibility.private.string')}</option><option value="public">{t('rooms.visibility.public.string')}</option></select><Button onClick={handleCreateRoom} disabled={creating || !roomName} className="w-full"><Plus className="h-4 w-4 mr-1" /> {t('button.create.string')}</Button>{rooms.length > 0 && rooms.map((r: any) => (<div key={r.id} className="p-2 rounded border text-sm"><div className="flex items-center gap-2"><span className="font-medium">{r.name}</span><Badge variant="outline" className="text-xs">{r.visibility}</Badge></div><p className="text-xs text-muted-foreground">{r.members?.length ?? 0} members | {r.message_count ?? 0} messages</p></div>))}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4" /> {t('links.title.string')}</CardTitle></CardHeader><CardContent>{links.length === 0 ? <p className="text-muted-foreground text-sm">{t('links.empty.string')}</p> : links.map((l: any) => (<div key={l.sogo_email} className="p-2 rounded border text-sm mb-2"><div className="font-medium">{l.sogo_email}</div><div className="text-xs text-muted-foreground font-mono">{l.mxid}</div></div>))}</CardContent></Card>
      </div>
    </div>
  )
}
