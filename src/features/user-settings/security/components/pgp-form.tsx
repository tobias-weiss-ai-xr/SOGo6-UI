'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { Key, KeyRound, Loader2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useState } from 'react'

interface PGPKeyInfo {
  fingerprint: string
  public_key: string
}

export default function PGPForm() {
  const t = useTranslations('US_SECURITY')
  const jwtToken = useAppSelector((s: RootState) => s.auth?.jwtToken ?? '')
  const [keyInfo, setKeyInfo] = useState<PGPKeyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const apiBase = '/api/user/v1/pgp'

  const fetchKey = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const resp = await fetch(`${apiBase}/key`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      const data = await resp.json()
      if (data.data?.public_key) {
        setKeyInfo(data.data)
      } else {
        setKeyInfo(null)
      }
    } catch {
      setKeyInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [jwtToken])

  const generateKey = async () => {
    setIsLoading(true)
    setError('')
    try {
      const resp = await fetch(`${apiBase}/key/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({}),
      })
      const data = await resp.json()
      if (data.data?.public_key) {
        setKeyInfo(data.data)
      } else if (data.error_code) {
        setError(data.error_msg || 'Failed to generate key')
      }
    } catch (e) {
      setError('Failed to generate key')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteKey = async () => {
    setIsLoading(true)
    try {
      await fetch(`${apiBase}/key`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      setKeyInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchKey() }, [fetchKey])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          {t('pgp.title')}
        </CardTitle>
        <CardDescription>{t('pgp.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('pgp.loading')}
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        {!isLoading && keyInfo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs">{t('pgp.fingerprint')}: {keyInfo.fingerprint}</span>
            </div>
            <div className="bg-muted max-h-32 overflow-auto rounded p-2">
              <pre className="text-[10px]">{keyInfo.public_key.slice(0, 300)}...</pre>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(keyInfo.public_key)
                }}
              >
                {t('pgp.copyPublicKey')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteKey}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('pgp.deleteKey')}
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !keyInfo && !error && (
          <Button onClick={generateKey}>
            <KeyRound className="mr-2 h-4 w-4" />
            {t('pgp.generateKey')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
