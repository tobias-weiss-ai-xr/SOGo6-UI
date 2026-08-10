'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useAddEmailAuthDomainMutation,
  useDeleteEmailAuthDomainMutation,
  useGenerateDkimKeyPairMutation,
  useGetEmailAuthDomainStatusQuery,
  useListEmailAuthDomainsQuery,
  useListDkimConfigsQuery,
  useListDmarcPoliciesQuery,
  useListSpfRecordsQuery,
  useRotateDkimKeysMutation,
  useSetDkimConfigMutation,
  useSetDmarcPolicyMutation,
  useSetSpfConfigMutation,
  useTestEmailAuthMutation,
  useValidateAllDomainsMutation,
  useValidateDkimDnsMutation,
  useValidateDmarcDnsMutation,
  useValidateSpfDnsMutation,
} from '@/features/admin-panel/store/email-auth-api'
import type { AuthStatus } from '@/features/admin-panel/email-auth-types'
import { useTranslations } from 'next-intl'
import { Check, Copy, Key, Mail, RefreshCw, Shield, Trash2, AlertTriangle } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

const STATUS_STYLES: Record<AuthStatus, string> = {
  ok: 'bg-green-100 text-green-800 hover:bg-green-100',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  error: 'bg-red-100 text-red-800 hover:bg-red-100',
  none: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
}

const STATUS_LABELS: Record<AuthStatus, string> = {
  ok: 'status.ok',
  warning: 'status.warning',
  error: 'status.error',
  none: 'status.none',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('AP_EMAIL_AUTH')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t('common.copied.string'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('common.error.string'))
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label={t('common.copy.string')}>
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

function StatusBadge({ status }: { status: AuthStatus }) {
  const t = useTranslations('AP_EMAIL_AUTH')
  const key = STATUS_LABELS[status]
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {t(`${key}.string`)}
    </Badge>
  )
}

export default function EmailAuthenticationPage() {
  const t = useTranslations('AP_EMAIL_AUTH')
  const [domainName, setDomainName] = useState('')
  const [domainDescription, setDomainDescription] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [testAddress, setTestAddress] = useState('')

  // ── data ──────────────────────────────────────────────────────────────
  const { data: domainsData, isLoading, refetch } = useListEmailAuthDomainsQuery()
  const { data: dkimData } = useListDkimConfigsQuery()
  const { data: dmarcData } = useListDmarcPoliciesQuery()
  const { data: spfData } = useListSpfRecordsQuery()
  const { data: statusData } = useGetEmailAuthDomainStatusQuery(selectedDomain, {
    skip: !selectedDomain,
  })

  const domains = domainsData?.domains ?? []
  const activeDomain = selectedDomain || domains[0]?.name || ''
  const dkimForDomain = dkimData?.dkim_configs?.find((c) => c.domain === activeDomain)
  const dmarcForDomain = dmarcData?.dmarc_policies?.find((c) => c.domain === activeDomain)
  const spfForDomain = spfData?.spf_records?.find((c) => c.domain === activeDomain)

  // ── mutations ─────────────────────────────────────────────────────────
  const [addDomain] = useAddEmailAuthDomainMutation()
  const [deleteDomain] = useDeleteEmailAuthDomainMutation()
  const [generateKey] = useGenerateDkimKeyPairMutation()
  const [setDkim] = useSetDkimConfigMutation()
  const [rotateDkim] = useRotateDkimKeysMutation()
  const [setDmarc] = useSetDmarcPolicyMutation()
  const [setSpf] = useSetSpfConfigMutation()
  const [validateDkim] = useValidateDkimDnsMutation()
  const [validateDmarc] = useValidateDmarcDnsMutation()
  const [validateSpf] = useValidateSpfDnsMutation()
  const [validateAll] = useValidateAllDomainsMutation()
  const [testEmail] = useTestEmailAuthMutation()

  // form state
  const [selector, setSelector] = useState('default')
  const [keyLength, setKeyLength] = useState('2048')
  const [generatedPublicKey, setGeneratedPublicKey] = useState('')
  const [generatedRecord, setGeneratedRecord] = useState('')
  const [dmarcPolicy, setDmarcPolicy] = useState('none')
  const [dmarcPct, setDmarcPct] = useState('100')
  const [dmarcRua, setDmarcRua] = useState('')
  const [spfIncludes, setSpfIncludes] = useState('')
  const [spfIp4, setSpfIp4] = useState('')
  const [spfAll, setSpfAll] = useState('-all')
  const [validationResult, setValidationResult] = useState<string>('')

  // ── handlers ──────────────────────────────────────────────────────────

  const handleAddDomain = async () => {
    if (!domainName.trim()) {
      toast.error(t('domains.name.string'))
      return
    }
    try {
      await addDomain({
        name: domainName.trim(),
        description: domainDescription.trim(),
      }).unwrap()
      toast.success(t('domains.added.string'))
      setDomainName('')
      setDomainDescription('')
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('domains.addFailed.string'))
    }
  }

  const handleDeleteDomain = async (domain: string) => {
    try {
      await deleteDomain(domain).unwrap()
      toast.success(t('domains.deleted.string'))
      if (selectedDomain === domain) setSelectedDomain('')
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('domains.deleteFailed.string'))
    }
  }

  const handleGenerateKey = async () => {
    try {
      const result = await generateKey({ key_length: Number(keyLength) }).unwrap()
      const pub = result.key_pair.public_key
      setGeneratedPublicKey(pub)
      const record = `v=DKIM1; k=rsa; p=${pub}`
      setGeneratedRecord(record)
      toast.success(t('dkim.generated.string'))
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  const handleSaveDkim = async () => {
    if (!activeDomain) return
    try {
      await setDkim({
        domain: activeDomain,
        body: {
          selector,
          key_length: Number(keyLength),
          public_key: generatedPublicKey || dkimForDomain?.public_key || undefined,
        },
      }).unwrap()
      toast.success(t('dkim.saved.string'))
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  const handleRotateDkim = async () => {
    if (!activeDomain) return
    try {
      const result = await rotateDkim({ domain: activeDomain }).unwrap()
      setGeneratedPublicKey(result.dkim.public_key ?? '')
      toast.success(t('dkim.rotated.string'))
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  const handleSaveDmarc = async () => {
    if (!activeDomain) return
    try {
      await setDmarc({
        domain: activeDomain,
        body: {
          policy: dmarcPolicy as 'none' | 'quarantine' | 'reject',
          pct: Number(dmarcPct),
          rua: dmarcRua ? [dmarcRua] : [],
        },
      }).unwrap()
      toast.success(t('dmarc.saved.string'))
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  const handleSaveSpf = async () => {
    if (!activeDomain) return
    try {
      await setSpf({
        domain: activeDomain,
        body: {
          include_mechanisms: spfIncludes
            ? spfIncludes.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          ip4_mechanisms: spfIp4
            ? spfIp4.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          all_qualifier: spfAll as '+all' | '-all' | '~all' | '?all',
        },
      }).unwrap()
      toast.success(t('spf.saved.string'))
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  const runValidation = async (kind: 'dkim' | 'dmarc' | 'spf') => {
    if (!activeDomain) return
    try {
      const map = {
        dkim: validateDkim,
        dmarc: validateDmarc,
        spf: validateSpf,
      } as const
      const result = await map[kind](activeDomain).unwrap()
      const v = result.validation
      const lines = [
        v.is_valid ? '✅ valid' : '❌ invalid',
        ...(v.errors?.length ? v.errors.map((e: string) => `• ${e}`) : []),
        ...(v.warnings?.length ? v.warnings.map((w: string) => `⚠ ${w}`) : []),
      ]
      setValidationResult(lines.join('\n'))
      toast.success(t('domains.validated.string'))
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  const handleValidateAll = async () => {
    try {
      await validateAll().unwrap()
      toast.success(t('domains.validated.string'))
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  const handleTest = async () => {
    if (!testAddress.trim()) return
    try {
      const result = await testEmail({ from_address: testAddress.trim() }).unwrap()
      setValidationResult(
        `SMTP ${result.test.sent ? t('test.sent.string') : t('test.failed.string')}: ${result.test.smtp_response}`
      )
    } catch (error: any) {
      toast.error(error?.data?.error_msg || t('common.error.string'))
    }
  }

  // ── render ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            {t('title.string')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('description.string')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidateAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('domains.validateAll.string')}
          </Button>
        </div>
      </div>

      {/* Domain list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('domains.title.string')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder={t('domains.namePlaceholder.string')}
              className="max-w-xs"
            />
            <Input
              value={domainDescription}
              onChange={(e) => setDomainDescription(e.target.value)}
              placeholder={t('domains.description.string')}
              className="max-w-xs"
            />
            <Button onClick={handleAddDomain}>{t('domains.add.string')}</Button>
          </div>

          {domains.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">{t('domains.empty.string')}</p>
          ) : (
            <div className="divide-y">
              {domains.map((domain) => (
                <div key={domain.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <button
                      className="font-mono text-sm hover:underline"
                      onClick={() => setSelectedDomain(domain.name)}
                    >
                      {domain.name}
                    </button>
                    {domain.description && (
                      <span className="text-xs text-muted-foreground">{domain.description}</span>
                    )}
                    {domain.name === selectedDomain && (
                      <Badge variant="secondary" className="text-xs">selected</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDomain(domain.name)}
                    aria-label={t('domains.delete.string')}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status overview */}
      {activeDomain && statusData?.status && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('status.overall.string')} — <span className="font-mono">{statusData.status.domain}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('status.dkim.string')}:</span>
              <StatusBadge status={statusData.status.dkim_status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('status.dmarc.string')}:</span>
              <StatusBadge status={statusData.status.dmarc_status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('status.spf.string')}:</span>
              <StatusBadge status={statusData.status.spf_status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('status.overall.string')}:</span>
              <StatusBadge status={statusData.status.overall_status} />
            </div>
            {statusData.status.overall_recommendations?.length > 0 && (
              <ul className="w-full space-y-1">
                {statusData.status.overall_recommendations.map((rec) => (
                  <li key={rec} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Config tabs */}
      {activeDomain && (
        <Tabs defaultValue="dkim">
          <TabsList>
            <TabsTrigger value="dkim">{t('dkim.title.string')}</TabsTrigger>
            <TabsTrigger value="dmarc">{t('dmarc.title.string')}</TabsTrigger>
            <TabsTrigger value="spf">{t('spf.title.string')}</TabsTrigger>
            <TabsTrigger value="test">{t('test.title.string')}</TabsTrigger>
          </TabsList>

          <TabsContent value="dkim" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" /> {t('dkim.title.string')} —{' '}
                  <span className="font-mono">{activeDomain}</span>
                </CardTitle>
                <CardDescription>{t('dkim.publicKey.string')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-end">
                  <div className="space-y-1">
                    <Label>{t('dkim.selector.string')}</Label>
                    <Input value={selector} onChange={(e) => setSelector(e.target.value)} className="w-40" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('dkim.keyLength.string')}</Label>
                    <Select value={keyLength} onValueChange={setKeyLength}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1024</SelectItem>
                        <SelectItem value="2048">2048</SelectItem>
                        <SelectItem value="4096">4096</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleGenerateKey} variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    {t('dkim.generateKey.string')}
                  </Button>
                  <Button onClick={handleSaveDkim}>{t('dkim.configure.string')}</Button>
                  <Button onClick={handleRotateDkim} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('dkim.rotate.string')}
                  </Button>
                  <Button onClick={() => runValidation('dkim')} variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    {t('dkim.validate.string')}
                  </Button>
                </div>

                {(generatedPublicKey || dkimForDomain?.public_key) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24">{t('dkim.publicKey.string')}</span>
                      <code className="flex-1 break-all bg-muted rounded p-2 text-xs">
                        {generatedPublicKey || dkimForDomain?.public_key}
                      </code>
                      <CopyButton text={generatedPublicKey || dkimForDomain?.public_key || ''} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24">{t('dkim.dnsRecord.string')}</span>
                      <code className="flex-1 break-all bg-muted rounded p-2 text-xs">
                        {generatedRecord ||
                          dkimForDomain?.dns_record?.value ||
                          `v=DKIM1; k=rsa; p=${dkimForDomain?.public_key ?? ''}`}
                      </code>
                      <CopyButton
                        text={generatedRecord || dkimForDomain?.dns_record?.value || ''}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dmarc" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">DMARC — <span className="font-mono">{activeDomain}</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-end">
                  <div className="space-y-1">
                    <Label>{t('dmarc.policy.string')}</Label>
                    <Select value={dmarcPolicy} onValueChange={setDmarcPolicy}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">none</SelectItem>
                        <SelectItem value="quarantine">quarantine</SelectItem>
                        <SelectItem value="reject">reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>{t('dmarc.pct.string')}</Label>
                    <Input value={dmarcPct} onChange={(e) => setDmarcPct(e.target.value)} className="w-24" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label>{t('dmarc.reportEmail.string')}</Label>
                    <Input
                      value={dmarcRua}
                      onChange={(e) => setDmarcRua(e.target.value)}
                      placeholder="dmarc@example.org"
                    />
                  </div>
                  <Button onClick={handleSaveDmarc}>{t('dmarc.configure.string')}</Button>
                  <Button onClick={() => runValidation('dmarc')} variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    {t('dmarc.validate.string')}
                  </Button>
                </div>
                {dmarcForDomain?.record_value && (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all bg-muted rounded p-2 text-xs">{dmarcForDomain.record_value}</code>
                    <CopyButton text={dmarcForDomain.record_value} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spf" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SPF — <span className="font-mono">{activeDomain}</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label>{t('spf.includes.string')}</Label>
                    <Input
                      value={spfIncludes}
                      onChange={(e) => setSpfIncludes(e.target.value)}
                      placeholder="_spf.google.com, spf.protection.outlook.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('spf.ip4.string')}</Label>
                    <Input value={spfIp4} onChange={(e) => setSpfIp4(e.target.value)} placeholder="192.0.2.0/24" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('spf.allQualifier.string')}</Label>
                    <Select value={spfAll} onValueChange={setSpfAll}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-all">-all</SelectItem>
                        <SelectItem value="~all">~all</SelectItem>
                        <SelectItem value="?all">?all</SelectItem>
                        <SelectItem value="+all">+all</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSpf}>{t('spf.configure.string')}</Button>
                  <Button onClick={() => runValidation('spf')} variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    {t('spf.validate.string')}
                  </Button>
                </div>
                {spfForDomain?.record_value && (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all bg-muted rounded p-2 text-xs">{spfForDomain.record_value}</code>
                    <CopyButton text={spfForDomain.record_value} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('test.title.string')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    placeholder={t('test.from.string')}
                    className="max-w-sm"
                  />
                  <Button onClick={handleTest}>{t('test.run.string')}</Button>
                </div>
                {validationResult && (
                  <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap font-mono">
                    {validationResult}
                  </pre>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
