'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAnalyzePstMutation, useStartPstImportMutation, useDiscoverM365Mutation, useStartM365ImportMutation, useListImportJobsQuery, useCancelImportJobMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Upload, CloudUpload, RotateCcw, FileArchive, Cloud } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function ImportExportPage(): ReactNode {
  const t = useTranslations('IMPORT')
  const [pstPath, setPstPath] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [m365Email, setM365Email] = useState('')
  const [m365Token, setM365Token] = useState('')
  const [pstInfo, setPstInfo] = useState<any>(null)
  const [m365Info, setM365Info] = useState<any>(null)
  const { data: jobsData, refetch } = useListImportJobsQuery(undefined, { pollingInterval: 5000 })
  const jobs = (jobsData as any)?.data ?? []
  const [analyzePst, { isLoading: analyzing }] = useAnalyzePstMutation()
  const [startPst, { isLoading: pstImporting }] = useStartPstImportMutation()
  const [discoverM365, { isLoading: discovering }] = useDiscoverM365Mutation()
  const [startM365, { isLoading: m365Importing }] = useStartM365ImportMutation()
  const [cancelJob] = useCancelImportJobMutation()
  const handleAnalyze = useCallback(async () => {
    if (!pstPath) return
    try { const r = await analyzePst({ pst_path: pstPath }).unwrap(); setPstInfo(r); toast.success(t('success.analyze.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [pstPath, analyzePst, t])
  const handlePstImport = useCallback(async () => {
    if (!pstPath || !targetUser) { toast.error(t('errors.fields.string')); return }
    try { await startPst({ pst_path: pstPath, target_user: targetUser }).unwrap(); refetch(); toast.success(t('success.import.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [pstPath, targetUser, startPst, refetch, t])
  const handleDiscover = useCallback(async () => {
    if (!m365Email || !m365Token) { toast.error(t('errors.fields.string')); return }
    try { const r = await discoverM365({ email: m365Email, access_token: m365Token }).unwrap(); setM365Info(r) } catch { toast.error(t('errors.fail.string')) }
  }, [m365Email, m365Token, discoverM365, t])
  const handleM365Import = useCallback(async () => {
    if (!m365Email || !m365Token) return
    try { await startM365({ email: m365Email, access_token: m365Token }).unwrap(); refetch(); toast.success(t('success.import.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [m365Email, m365Token, startM365, refetch, t])
  const handleCancel = useCallback(async (jobId: string) => {
    try { await cancelJob(jobId).unwrap(); refetch() } catch { toast.error(t('errors.fail.string')) }
  }, [cancelJob, refetch, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Upload className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><FileArchive className="h-4 w-4" /> PST Import</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={pstPath} onChange={e => setPstPath(e.target.value)} placeholder="/data/imports/archive.pst" /><Input value={targetUser} onChange={e => setTargetUser(e.target.value)} placeholder="user@example.org" /><div className="flex gap-2"><Button onClick={handleAnalyze} disabled={analyzing || !pstPath} variant="outline"><Upload className="h-4 w-4 mr-1" /> Analyze</Button><Button onClick={handlePstImport} disabled={pstImporting || !pstPath || !targetUser}><CloudUpload className="h-4 w-4 mr-1" /> Import</Button></div>{pstInfo && (<div className="p-3 rounded bg-muted/50 text-sm space-y-1"><div><span className="text-muted-foreground">File size: </span>{(pstInfo.file_size / 1048576).toFixed(1)} MB</div><div><span className="text-muted-foreground">Estimated messages: </span>{pstInfo.estimated_messages}</div><div><span className="text-muted-foreground">Est. time: </span>{pstInfo.import_estimate?.estimated_minutes ?? 0} min</div>{pstInfo.valid && <Badge className="bg-green-600">Valid PST</Badge>}</div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="h-4 w-4" /> M365 Import</CardTitle></CardHeader><CardContent className="space-y-4"><Input value={m365Email} onChange={e => setM365Email(e.target.value)} placeholder="user@tenant.onmicrosoft.com" /><Input value={m365Token} onChange={e => setM365Token(e.target.value)} type="password" placeholder="OAuth2 access token" /><div className="flex gap-2"><Button onClick={handleDiscover} disabled={discovering || !m365Email || !m365Token} variant="outline">Discover</Button><Button onClick={handleM365Import} disabled={m365Importing || !m365Email || !m365Token}><CloudUpload className="h-4 w-4 mr-1" /> Import</Button></div>{m365Info && (<div className="p-3 rounded bg-muted/50 text-sm space-y-1"><div><span className="text-muted-foreground">Total messages: </span>{m365Info.total_messages}</div><div><span className="text-muted-foreground">Folders: </span>{m365Info.folders?.length ?? 0}</div><div className="flex flex-wrap gap-1">{m365Info.folders?.map((f: any) => (<Badge key={f.id} variant="outline" className="text-xs">{f.displayName}: {f.totalItemCount}</Badge>))}</div></div>)}</CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">{t('jobs.title.string')}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead>Started</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{jobs.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t('jobs.empty.string')}</TableCell></TableRow> : jobs.map((j: any) => (<TableRow key={j.id}><TableCell className="font-mono text-xs">{j.id}</TableCell><TableCell><Badge variant="outline">{j.type}</Badge></TableCell><TableCell><Badge variant={j.status === 'completed' ? 'default' : j.status === 'running' ? 'secondary' : 'destructive'} className="capitalize">{j.status}</Badge></TableCell><TableCell>{j.imported}/{j.total_messages}</TableCell><TableCell className="text-xs text-muted-foreground">{j.started_at ? new Date(j.started_at * 1000).toLocaleString() : '-'}</TableCell><TableCell>{j.status === 'running' && <Button variant="ghost" size="sm" onClick={() => handleCancel(j.id)}><RotateCcw className="h-3 w-3" /></Button>}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}
