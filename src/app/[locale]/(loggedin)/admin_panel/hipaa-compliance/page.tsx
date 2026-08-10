'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGetHipaaConfigQuery, useSetHipaaConfigMutation, useDetectPhiMutation, useGetHipaaAuditTrailQuery, useLogHipaaAccessMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { ShieldCheck, Scan, ClipboardList } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function HipaaCompliancePage(): ReactNode {
  const t = useTranslations('HIPAA')
  const [text, setText] = useState('')
  const [phiResult, setPhiResult] = useState<any>(null)
  const [logEmail, setLogEmail] = useState('')
  const [logAction, setLogAction] = useState('view')
  const [logReason, setLogReason] = useState('')
  const { data: configData, refetch: refetchConfig } = useGetHipaaConfigQuery()
  const config = (configData as any)?.data ?? { enabled: false, encryption_at_rest: true, audit_trail: true, phi_detection: true }
  const { data: auditData, refetch: refetchAudit } = useGetHipaaAuditTrailQuery(undefined, { pollingInterval: 10000 })
  const audit = (auditData as any)?.data ?? []
  const [setConfig] = useSetHipaaConfigMutation()
  const [detectPhi, { isLoading: scanning }] = useDetectPhiMutation()
  const [logAccess] = useLogHipaaAccessMutation()
  const handleToggle = useCallback(async (key: string, value: boolean) => {
    try { await setConfig({ ...config, [key]: value }).unwrap(); refetchConfig() } catch { toast.error(t('errors.fail.string')) }
  }, [config, setConfig, refetchConfig, t])
  const handleDetect = useCallback(async () => {
    if (!text) return
    try { const r = await detectPhi({ text }).unwrap(); setPhiResult(r) } catch { toast.error(t('errors.fail.string')) }
  }, [text, detectPhi, t])
  const handleLog = useCallback(async () => {
    if (!logEmail) { toast.error(t('errors.email.string')); return }
    try { await logAccess({ email_id: logEmail, accessor: logEmail, action: logAction, reason: logReason }).unwrap(); setLogEmail(''); setLogReason(''); refetchAudit(); toast.success(t('success.log.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [logEmail, logAction, logReason, logAccess, refetchAudit, t])
  const riskColor = (level: string) => level === 'critical' ? 'bg-red-600' : level === 'high' ? 'bg-orange-600' : level === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">{t('config.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4">{[
            { key: 'enabled', label: t('config.enabled.string') },
            { key: 'encryption_at_rest', label: t('config.encryption.string') },
            { key: 'audit_trail', label: t('config.audit.string') },
            { key: 'phi_detection', label: t('config.phi_detection.string') },
            { key: 'access_requires_reason', label: t('config.require_reason.string') },
          ].map(item => (<div key={item.key} className="flex items-center justify-between"><Label>{item.label}</Label><Switch checked={!!config[item.key]} onCheckedChange={v => handleToggle(item.key, v)} /></div>))}<div className="flex items-center justify-between"><Label>{t('config.retention.string')}</Label><Badge variant="outline">{config.minimum_log_retention_days ?? 2190} {t('label.days.string')}</Badge></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('detect.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><Textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder={t('detect.placeholder.string')} /><Button onClick={handleDetect} disabled={scanning || !text} className="w-full"><Scan className="h-4 w-4 mr-1" /> {t('detect.button.string')}</Button>{phiResult && (<div className="space-y-2"><div className="flex items-center gap-2"><span className="text-sm font-medium">{t('detect.risk.string')}</span><Badge className={riskColor(phiResult.risk_level)}>{phiResult.risk_level?.toUpperCase()}</Badge></div>{phiResult.ssn_detected && <Badge variant="destructive">SSN ({phiResult.ssn_count})</Badge>}{phiResult.dob_detected && <Badge variant="destructive">DOB</Badge>}{phiResult.mrn_detected && <Badge variant="destructive">MRN</Badge>}{phiResult.phi_keywords?.length > 0 && <div className="flex flex-wrap gap-1">{phiResult.phi_keywords.map((k: string, i: number) => (<Badge key={i} variant="outline" className="text-xs">{k}</Badge>))}</div>}<p className="text-xs text-muted-foreground">{phiResult.recommendation}</p></div>)}</CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> {t('audit.title.string')}<Badge variant="outline">{audit.length}</Badge></CardTitle></CardHeader><CardContent><div className="flex gap-3 mb-4"><Input value={logEmail} onChange={e => setLogEmail(e.target.value)} placeholder={t('audit.email.placeholder.string')} /><Input value={logReason} onChange={e => setLogReason(e.target.value)} placeholder={t('audit.reason.placeholder.string')} className="flex-1" /><Button onClick={handleLog}>{t('audit.log.string')}</Button></div><Table><TableHeader><TableRow><TableHead>{t('audit.accessor.string')}</TableHead><TableHead>{t('audit.action.string')}</TableHead><TableHead>{t('audit.reason.string')}</TableHead><TableHead>{t('audit.time.string')}</TableHead></TableRow></TableHeader><TableBody>{audit.slice(0, 50).map((e: any) => (<TableRow key={e.id}><TableCell className="font-mono text-xs">{e.accessor}</TableCell><TableCell><Badge variant="outline">{e.action}</Badge></TableCell><TableCell className="text-sm">{e.patient_context || '-'}</TableCell><TableCell className="text-xs text-muted-foreground">{new Date(e.timestamp * 1000).toLocaleString()}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}
