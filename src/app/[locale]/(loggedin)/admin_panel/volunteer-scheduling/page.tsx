'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useListVolunteersQuery, useCreateVolunteerMutation, useListVolunteerShiftsQuery, useCreateVolunteerShiftMutation, useGenerateCertificateMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { HandHelping, Plus, Clock, Award } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function VolunteerSchedulingPage(): ReactNode {
  const t = useTranslations('VOLUNTEER')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const { data, refetch } = useListVolunteersQuery(undefined, { pollingInterval: 15000 })
  const { data: shiftsData } = useListVolunteerShiftsQuery()
  const volunteers = (data as any)?.data ?? []
  const shifts = (shiftsData as any)?.data ?? []
  const [createVol, { isLoading: creatingVol }] = useCreateVolunteerMutation()
  const [createShift, { isLoading: creatingShift }] = useCreateVolunteerShiftMutation()
  const [genCert] = useGenerateCertificateMutation()
  const [shiftVolId, setShiftVolId] = useState('')
  const [shiftTask, setShiftTask] = useState('')
  const [shiftStart, setShiftStart] = useState('')
  const [shiftEnd, setShiftEnd] = useState('')
  const handleCreateVol = useCallback(async () => {
    if (!name || !email) { toast.error(t('errors.fields.string')); return }
    try { await createVol({ name, email }).unwrap(); setName(''); setEmail(''); refetch(); toast.success(t('success.create.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [name, email, createVol, refetch, t])
  const handleCreateShift = useCallback(async () => {
    if (!shiftVolId || !shiftStart || !shiftEnd) { toast.error(t('errors.fields.string')); return }
    try { await createShift({ volunteer_id: shiftVolId, task: shiftTask, start_time: new Date(shiftStart).getTime() / 1000, end_time: new Date(shiftEnd).getTime() / 1000 }).unwrap(); setShiftTask(''); setShiftStart(''); setShiftEnd(''); refetch(); toast.success(t('success.shift.string')) } catch (e: any) { toast.error(e?.data?.error_msg || t('errors.fail.string')) }
  }, [shiftVolId, shiftTask, shiftStart, shiftEnd, createShift, refetch, t])
  const handleCert = useCallback(async (volId: string) => {
    try { const r = await genCert(volId).unwrap(); toast.success(`${t('success.cert.string')}: ${r.certificate_id?.slice(0, 8)}`) } catch { toast.error(t('errors.fail.string')) }
  }, [genCert, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><HandHelping className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">{t('register.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={name} onChange={e => setName(e.target.value)} placeholder={t('field.name.string')} /><Input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('field.email.string')} /><Button onClick={handleCreateVol} disabled={creatingVol || !name || !email} className="w-full"><Plus className="h-4 w-4 mr-1" /> {t('button.register.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('shift.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><select value={shiftVolId} onChange={e => setShiftVolId(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm"><option value="">{t('shift.select.string')}</option>{volunteers.map((v: any) => (<option key={v.id} value={v.id}>{v.name}</option>))}</select><Input value={shiftTask} onChange={e => setShiftTask(e.target.value)} placeholder={t('shift.task.string')} /><div className="grid gap-2 sm:grid-cols-2"><div><label className="text-xs text-muted-foreground">{t('shift.start.string')}</label><Input type="datetime-local" value={shiftStart} onChange={e => setShiftStart(e.target.value)} /></div><div><label className="text-xs text-muted-foreground">{t('shift.end.string')}</label><Input type="datetime-local" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} /></div></div><Button onClick={handleCreateShift} disabled={creatingShift || !shiftVolId} className="w-full"><Clock className="h-4 w-4 mr-1" /> {t('button.assign.string')}</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('stats.title.string')}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">{volunteers.length}</p><p className="text-xs text-muted-foreground">{t('stats.volunteers.string')}</p></div><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">{volunteers.reduce((s: number, v: any) => s + (v.total_hours ?? 0), 0).toFixed(1)}</p><p className="text-xs text-muted-foreground">{t('stats.hours.string')}</p></div><div className="p-3 rounded bg-muted/50"><p className="text-2xl font-bold">{shifts.length}</p><p className="text-xs text-muted-foreground">{t('stats.shifts.string')}</p></div></CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">{t('list.title.string')}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t('field.name.string')}</TableHead><TableHead>{t('field.email.string')}</TableHead><TableHead>{t('field.hours.string')}</TableHead><TableHead>{t('field.status.string')}</TableHead><TableHead>{t('field.no_shows.string')}</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{volunteers.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t('list.empty.string')}</TableCell></TableRow> : volunteers.map((v: any) => (<TableRow key={v.id}><TableCell className="font-medium">{v.name}</TableCell><TableCell className="text-sm">{v.email}</TableCell><TableCell>{v.total_hours?.toFixed(1) ?? '0.0'}h</TableCell><TableCell><Badge variant={v.status === 'active' ? 'default' : 'secondary'} className="capitalize">{v.status}</Badge></TableCell><TableCell>{v.no_show_count ?? 0}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => handleCert(v.id)}><Award className="h-3 w-3" /></Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}
