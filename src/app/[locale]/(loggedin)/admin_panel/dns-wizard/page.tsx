'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useGenerateSpfRecordMutation,
  useValidateSpfRecordMutation,
  useGenerateDkimRecordMutation,
  useGenerateDmarcRecordMutation,
  useValidateDmarcRecordMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import type { DnsRecord, DnsValidation } from '@/features/admin-panel/store/dns-wizard-api'
import { useTranslations } from 'next-intl'
import { Copy, Check, Shield, Mail, Key, AlertTriangle, RefreshCw } from 'lucide-react'
import React, { useState, useCallback } from 'react'
import { toast } from 'sonner'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }, [text])

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} aria-label="Copy to clipboard">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

function RecordResultCard({ record }: { record: DnsRecord }) {
  const t = useTranslations('AP_DNS_WIZARD')

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('record.title.string')}</CardTitle>
        <CardDescription>{record.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <Label className="text-muted-foreground">{t('record.name.string')}</Label>
            <p className="font-mono font-medium">{record.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">{t('record.type.string')}</Label>
            <p className="font-mono font-medium">{record.type}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">{t('record.ttl.string')}</Label>
            <p className="font-mono font-medium">{record.ttl}</p>
          </div>
          {record.selector && (
            <div>
              <Label className="text-muted-foreground">{t('record.selector.string')}</Label>
              <p className="font-mono font-medium">{record.selector}</p>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">{t('record.value.string')}</Label>
            <CopyButton text={record.value} />
          </div>
          <div className="mt-1 rounded-md bg-muted p-3">
            <code className="text-sm break-all">{record.value}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ValidationResults({ result }: { result: DnsValidation }) {
  const t = useTranslations('AP_DNS_WIZARD')

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        {result.valid ? (
          <Badge variant="default" className="bg-green-600">{t('validation.valid.string')}</Badge>
        ) : (
          <Badge variant="destructive">{t('validation.invalid.string')}</Badge>
        )}
      </div>
      {result.errors.length > 0 && (
        <div className="space-y-1">
          {result.errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
      {result.warnings.length > 0 && (
        <div className="space-y-1">
          {result.warnings.map((warn, i) => (
            <div key={i} className="flex items-start gap-2 text-yellow-600 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SpfTab() {
  const t = useTranslations('AP_DNS_WIZARD')
  const [domain, setDomain] = useState('')
  const [mxServers, setMxServers] = useState('')
  const [ip4Addresses, setIp4Addresses] = useState('')
  const [ip6Addresses, setIp6Addresses] = useState('')
  const [includeDomains, setIncludeDomains] = useState('')
  const [policy, setPolicy] = useState('~all')
  const [result, setResult] = useState<DnsRecord | null>(null)

  const [generate, { isLoading }] = useGenerateSpfRecordMutation()

  const handleGenerate = useCallback(async () => {
    if (!domain.trim()) {
      toast.error(t('validation.domain_required.string'))
      return
    }
    try {
      const res = await generate({
        domain: domain.trim(),
        mx_servers: mxServers.trim() ? mxServers.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        ip4_addresses: ip4Addresses.trim() ? ip4Addresses.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        ip6_addresses: ip6Addresses.trim() ? ip6Addresses.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        include_domains: includeDomains.trim() ? includeDomains.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        policy,
      }).unwrap()
      setResult(res?.record ?? null)
    } catch {
      toast.error(t('errors.generate_failed.string'))
    }
  }, [domain, mxServers, ip4Addresses, ip6Addresses, includeDomains, policy, generate, t])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('spf.description.string')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('labels.domain.string')}</Label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.org" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.policy.string')}</Label>
          <Select value={policy} onValueChange={setPolicy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-all">-all ({t('policies.hardfail.string')})</SelectItem>
              <SelectItem value="~all">~all ({t('policies.softfail.string')})</SelectItem>
              <SelectItem value="+all">+all ({t('policies.neutral.string')})</SelectItem>
              <SelectItem value="?all">?all ({t('policies.no_policy.string')})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('labels.mx_servers.string')}</Label>
          <Input value={mxServers} onChange={(e) => setMxServers(e.target.value)} placeholder="mx1.example.org, mx2.example.org" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.ip4_addresses.string')}</Label>
          <Input value={ip4Addresses} onChange={(e) => setIp4Addresses(e.target.value)} placeholder="192.0.2.1" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.ip6_addresses.string')}</Label>
          <Input value={ip6Addresses} onChange={(e) => setIp6Addresses(e.target.value)} placeholder="2001:db8::1" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.include_domains.string')}</Label>
          <Input value={includeDomains} onChange={(e) => setIncludeDomains(e.target.value)} placeholder="spf.mailhost.com" />
        </div>
      </div>
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
        {t('spf.generate.string')}
      </Button>
      {result && <RecordResultCard record={result} />}
    </div>
  )
}

function DkimTab() {
  const t = useTranslations('AP_DNS_WIZARD')
  const [domain, setDomain] = useState('')
  const [selector, setSelector] = useState('sogo')
  const [keyType, setKeyType] = useState('ed25519')
  const [publicKey, setPublicKey] = useState('')
  const [result, setResult] = useState<DnsRecord | null>(null)

  const [generate, { isLoading }] = useGenerateDkimRecordMutation()

  const handleGenerate = useCallback(async () => {
    if (!domain.trim()) {
      toast.error(t('validation.domain_required.string'))
      return
    }
    try {
      const res = await generate({
        domain: domain.trim(),
        selector: selector.trim() || 'sogo',
        key_type: keyType,
        public_key: publicKey.trim() || undefined,
      }).unwrap()
      setResult(res?.record ?? null)
    } catch {
      toast.error(t('errors.generate_failed.string'))
    }
  }, [domain, selector, keyType, publicKey, generate, t])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('dkim.description.string')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('labels.domain.string')}</Label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.org" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.selector.string')}</Label>
          <Input value={selector} onChange={(e) => setSelector(e.target.value)} placeholder="sogo" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.key_type.string')}</Label>
          <Select value={keyType} onValueChange={setKeyType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ed25519">Ed25519 (recommended)</SelectItem>
              <SelectItem value="rsa">RSA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>{t('labels.public_key.string')}</Label>
          <Input
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder={t('dkim.public_key_placeholder.string')}
          />
          <p className="text-xs text-muted-foreground">{t('dkim.public_key_hint.string')}</p>
        </div>
      </div>
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
        {t('dkim.generate.string')}
      </Button>
      {result && <RecordResultCard record={result} />}
    </div>
  )
}

function DmarcTab() {
  const t = useTranslations('AP_DNS_WIZARD')
  const [domain, setDomain] = useState('')
  const [policy, setPolicy] = useState('none')
  const [ruaEmail, setRuaEmail] = useState('')
  const [rufEmail, setRufEmail] = useState('')
  const [pct, setPct] = useState('100')
  const [subdomainPolicy, setSubdomainPolicy] = useState('')
  const [aspf, setAspf] = useState('r')
  const [adkim, setAdkim] = useState('r')

  const [result, setResult] = useState<DnsRecord | null>(null)

  const [generate, { isLoading }] = useGenerateDmarcRecordMutation()

  const handleGenerate = useCallback(async () => {
    if (!domain.trim()) {
      toast.error(t('validation.domain_required.string'))
      return
    }
    try {
      const res = await generate({
        domain: domain.trim(),
        policy,
        rua_email: ruaEmail.trim() || undefined,
        ruf_email: rufEmail.trim() || undefined,
        pct: parseInt(pct, 10) || 100,
        subdomain_policy: subdomainPolicy || undefined,
        aspf,
        adkim,
      }).unwrap()
      setResult(res?.record ?? null)
    } catch {
      toast.error(t('errors.generate_failed.string'))
    }
  }, [domain, policy, ruaEmail, rufEmail, pct, subdomainPolicy, aspf, adkim, generate, t])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('dmarc.description.string')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('labels.domain.string')}</Label>
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.org" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.policy.string')}</Label>
          <Select value={policy} onValueChange={setPolicy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">none ({t('dmarc.policy_none.string')})</SelectItem>
              <SelectItem value="quarantine">quarantine ({t('dmarc.policy_quarantine.string')})</SelectItem>
              <SelectItem value="reject">reject ({t('dmarc.policy_reject.string')})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('labels.rua_email.string')}</Label>
          <Input value={ruaEmail} onChange={(e) => setRuaEmail(e.target.value)} placeholder="dmarc@example.org" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.ruf_email.string')}</Label>
          <Input value={rufEmail} onChange={(e) => setRufEmail(e.target.value)} placeholder="forensic@example.org" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.pct.string')}</Label>
          <Input type="number" min={1} max={100} value={pct} onChange={(e) => setPct(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.subdomain_policy.string')}</Label>
          <Select value={subdomainPolicy || '_none'} onValueChange={(v) => setSubdomainPolicy(v === '_none' ? '' : v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">{t('dmarc.inherit.string')}</SelectItem>
              <SelectItem value="none">none</SelectItem>
              <SelectItem value="quarantine">quarantine</SelectItem>
              <SelectItem value="reject">reject</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('labels.aspf.string')}</Label>
          <Select value={aspf} onValueChange={setAspf}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="r">r ({t('dmarc.relaxed.string')})</SelectItem>
              <SelectItem value="s">s ({t('dmarc.strict.string')})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('labels.adkim.string')}</Label>
          <Select value={adkim} onValueChange={setAdkim}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="r">r ({t('dmarc.relaxed.string')})</SelectItem>
              <SelectItem value="s">s ({t('dmarc.strict.string')})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
        {t('dmarc.generate.string')}
      </Button>
      {result && <RecordResultCard record={result} />}
    </div>
  )
}

function ValidateTab() {
  const t = useTranslations('AP_DNS_WIZARD')
  const [spfValue, setSpfValue] = useState('')
  const [dmarcValue, setDmarcValue] = useState('')
  const [spfResult, setSpfResult] = useState<DnsValidation | null>(null)
  const [dmarcResult, setDmarcResult] = useState<DnsValidation | null>(null)

  const [validateSpf, { isLoading: spfLoading }] = useValidateSpfRecordMutation()
  const [validateDmarc, { isLoading: dmarcLoading }] = useValidateDmarcRecordMutation()

  const handleValidateSpf = useCallback(async () => {
    if (!spfValue.trim()) {
      toast.error(t('validation.value_required.string'))
      return
    }
    try {
      const res = await validateSpf({ spf_value: spfValue.trim() }).unwrap()
      setSpfResult(res)
    } catch {
      toast.error(t('errors.validate_failed.string'))
    }
  }, [spfValue, validateSpf, t])

  const handleValidateDmarc = useCallback(async () => {
    if (!dmarcValue.trim()) {
      toast.error(t('validation.value_required.string'))
      return
    }
    try {
      const res = await validateDmarc({ dmarc_value: dmarcValue.trim() }).unwrap()
      setDmarcResult(res)
    } catch {
      toast.error(t('errors.validate_failed.string'))
    }
  }, [dmarcValue, validateDmarc, t])

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t('validate.description.string')}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('validate.spf_title.string')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-muted p-3">
            <code className="text-sm break-all">{spfValue || <span className="text-muted-foreground">v=spf1 mx ~all</span>}</code>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={spfValue}
              onChange={(e) => { setSpfValue(e.target.value); setSpfResult(null) }}
              placeholder="v=spf1 mx ~all"
            />
            <Button variant="outline" onClick={handleValidateSpf} disabled={spfLoading}>
              {spfLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
              {t('validate.button.string')}
            </Button>
          </div>
          {spfResult && <ValidationResults result={spfResult} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('validate.dmarc_title.string')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-muted p-3">
            <code className="text-sm break-all">{dmarcValue || <span className="text-muted-foreground">v=DMARC1; p=none; pct=100</span>}</code>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={dmarcValue}
              onChange={(e) => { setDmarcValue(e.target.value); setDmarcResult(null) }}
              placeholder="v=DMARC1; p=none; pct=100"
            />
            <Button variant="outline" onClick={handleValidateDmarc} disabled={dmarcLoading}>
              {dmarcLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
              {t('validate.button.string')}
            </Button>
          </div>
          {dmarcResult && <ValidationResults result={dmarcResult} />}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DnsWizardPage() {
  const t = useTranslations('AP_DNS_WIZARD')

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title.string')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
      </div>

      <Tabs defaultValue="spf" className="w-full">
        <TabsList>
          <TabsTrigger value="spf">
            <Shield className="h-4 w-4 mr-2" />
            {t('tabs.spf.string')}
          </TabsTrigger>
          <TabsTrigger value="dkim">
            <Key className="h-4 w-4 mr-2" />
            {t('tabs.dkim.string')}
          </TabsTrigger>
          <TabsTrigger value="dmarc">
            <Mail className="h-4 w-4 mr-2" />
            {t('tabs.dmarc.string')}
          </TabsTrigger>
          <TabsTrigger value="validate">
            <Check className="h-4 w-4 mr-2" />
            {t('tabs.validate.string')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="spf"><SpfTab /></TabsContent>
        <TabsContent value="dkim"><DkimTab /></TabsContent>
        <TabsContent value="dmarc"><DmarcTab /></TabsContent>
        <TabsContent value="validate"><ValidateTab /></TabsContent>
      </Tabs>
    </div>
  )
}
