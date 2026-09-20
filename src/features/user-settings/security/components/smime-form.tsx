'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import {
  BadgeCheck,
  KeyRound,
  Loader2,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

interface SmimeCertInfo {
  subject_cn?: string | null
  issuer_cn?: string | null
  not_after?: string
  fingerprint_sha256?: string
  self_signed?: boolean
}

export default function SmimeForm() {
  const t = useTranslations('US_SECURITY')
  const jwtToken = useAppSelector((s: RootState) => s.auth?.jwtToken ?? '')
  const [cert, setCert] = useState<SmimeCertInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const apiBase = '/api/user/v1/smime/certificate'

  const authHeaders = (json = false): Record<string, string> => ({
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${jwtToken}`,
  })

  const fetchCert = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const resp = await fetch(apiBase, { headers: authHeaders() })
      const data = await resp.json()
      setCert(data.data?.certificate ?? null)
    } catch {
      setCert(null)
    } finally {
      setIsLoading(false)
    }
  }, [jwtToken])

  const generate = async () => {
    setBusy(true)
    setError('')
    try {
      const resp = await fetch(`${apiBase}/generate`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ common_name: '', days: 365 }),
      })
      const data = await resp.json()
      if (data.data?.certificate) {
        setCert(data.data.certificate)
      } else {
        setError(data.error_msg || 'Failed to generate certificate')
      }
    } catch {
      setError('Failed to generate certificate')
    } finally {
      setBusy(false)
    }
  }

  const importBundle = async (file: File) => {
    setBusy(true)
    setError('')
    try {
      const buf = new Uint8Array(await file.arrayBuffer())
      const b64 = btoa(String.fromCharCode(...buf))
      const resp = await fetch(apiBase, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ bundle: b64, bundle_password: '' }),
      })
      const data = await resp.json()
      if (data.data?.certificate) {
        setCert(data.data.certificate)
      } else {
        setError(data.error_msg || 'Failed to import certificate')
      }
    } catch {
      setError('Failed to import certificate')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await fetch(apiBase, { method: 'DELETE', headers: authHeaders() })
      setCert(null)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void fetchCert()
  }, [fetchCert])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          {t('smime.title')}
        </CardTitle>
        <CardDescription>{t('smime.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('pgp.loading')}
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        {!isLoading && cert && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              <span className="font-mono text-xs">
                {cert.subject_cn ?? '—'}
                {cert.self_signed ? ` (${t('smime.selfSigned')})` : ''}
              </span>
            </div>
            <div className="text-muted-foreground font-mono text-xs">
              {cert.fingerprint_sha256?.slice(0, 32)}…
            </div>
            <div className="text-muted-foreground text-xs">
              {t('smime.validUntil')}:{' '}
              {cert.not_after
                ? new Date(cert.not_after).toLocaleDateString()
                : '—'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void remove()}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                {t('smime.delete')}
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !cert && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <ShieldAlert className="h-4 w-4" />
            {t('smime.noCertificate')}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            disabled={busy}
            onClick={() => void generate()}
          >
            {busy && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {t('smime.generate')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {t('smime.import')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".p12,.pfx,.pem,.crt,.key"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void importBundle(f)
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
