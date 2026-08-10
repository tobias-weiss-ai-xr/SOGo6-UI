'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSignDocumentMutation, useVerifySignatureMutation, useListEidasCertificatesQuery, useListEidasSignaturesQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Stamp, CheckCircle2, XCircle, FileSignature } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function EidasSignaturesPage(): ReactNode {
  const t = useTranslations('EIDAS')
  const [content, setContent] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [algorithm, setAlgorithm] = useState('SHA-256')
  const [lastSig, setLastSig] = useState<any>(null)
  const [verifyHash, setVerifyHash] = useState('')
  const [verifySig, setVerifySig] = useState('')
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const { data: certsData } = useListEidasCertificatesQuery()
  const { data: sigsData } = useListEidasSignaturesQuery()
  const certs = (certsData as any)?.data ?? []
  const sigs = (sigsData as any)?.data ?? []
  const [signDoc, { isLoading: signing }] = useSignDocumentMutation()
  const [verify, { isLoading: verifying }] = useVerifySignatureMutation()
  const handleSign = useCallback(async () => {
    if (!content || !signerEmail) { toast.error(t('errors.fields.string')); return }
    try { const r = await signDoc({ content, signer_email: signerEmail, algorithm, certificate_hash: certs[0]?.hash ?? '' }).unwrap(); setLastSig(r); toast.success(t('success.sign.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [content, signerEmail, algorithm, certs, signDoc, t])
  const handleVerify = useCallback(async () => {
    if (!verifyHash || !verifySig) { toast.error(t('errors.fields.string')); return }
    try { const r = await verify({ document_hash: verifyHash, signature: verifySig }).unwrap(); setVerifyResult(r) } catch { toast.error(t('errors.fail.string')) }
  }, [verifyHash, verifySig, verify, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Stamp className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">{t('sign.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder={t('sign.placeholder.string')} /><div className="grid gap-4 sm:grid-cols-2"><div><Label>{t('sign.signer.string')}</Label><Input value={signerEmail} onChange={e => setSignerEmail(e.target.value)} /></div><div><Label>{t('sign.algorithm.string')}</Label><select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm"><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></div></div><Button onClick={handleSign} disabled={signing || !content || !signerEmail} className="w-full"><FileSignature className="h-4 w-4 mr-1" /> {t('sign.button.string')}</Button>{lastSig && (<div className="p-3 rounded bg-muted/50 text-sm space-y-1"><div><span className="text-muted-foreground">Doc Hash: </span><code className="text-xs">{lastSig.document_hash?.slice(0, 32)}...</code></div><div><span className="text-muted-foreground">Signature: </span><code className="text-xs">{lastSig.signature?.slice(0, 32)}...</code></div><div><span className="text-muted-foreground">Algorithm: </span>{lastSig.algorithm}</div></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{t('verify.title.string')}</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>{t('verify.doc_hash.string')}</Label><Input value={verifyHash} onChange={e => setVerifyHash(e.target.value)} placeholder="64-char hex hash" /></div><div><Label>{t('verify.signature.string')}</Label><Input value={verifySig} onChange={e => setVerifySig(e.target.value)} placeholder="signature hex" /></div><Button onClick={handleVerify} disabled={verifying || !verifyHash || !verifySig} className="w-full">{t('verify.button.string')}</Button>{verifyResult && (<div className={`p-3 rounded border-2 ${verifyResult.valid ? 'border-green-600' : 'border-destructive'}`}><div className="flex items-center gap-2">{verifyResult.valid ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-destructive" />}<span className="font-medium">{verifyResult.valid ? t('verify.valid.string') : t('verify.invalid.string')}</span></div><p className="text-xs text-muted-foreground mt-1">{verifyResult.reason}</p></div>)}</CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="text-base">{t('certs.title.string')}</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>{t('certs.type.string')}</TableHead><TableHead>{t('certs.name.string')}</TableHead><TableHead>{t('certs.hash.string')}</TableHead></TableRow></TableHeader><TableBody>{certs.map((c: any) => (<TableRow key={c.hash}><TableCell><Badge variant="outline">{c.type}</Badge></TableCell><TableCell>{c.name}</TableCell><TableCell className="font-mono text-xs">{c.hash.slice(0, 24)}...</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}
