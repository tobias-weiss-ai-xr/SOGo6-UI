'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListOAuthClientsQuery, useRegisterOAuthClientMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Key, Plus, X, Copy, Check } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function OAuthClientsPage(): ReactNode {
  const t = useTranslations('AP_OAUTH')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const [scopes, setScopes] = useState('openid profile email')
  const [createdClient, setCreatedClient] = useState<{ client_id: string; client_secret: string } | null>(null)
  const [copied, setCopied] = useState<'id' | 'secret' | null>(null)

  const { data, isLoading } = useListOAuthClientsQuery()
  const [registerClient, { isLoading: registering }] = useRegisterOAuthClientMutation()

  const clients = data ?? []

  const handleRegister = useCallback(async () => {
    if (!name || !redirectUri) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      const result = await registerClient({
        name,
        redirect_uris: redirectUri.split(',').map(u => u.trim()).filter(Boolean),
        scopes: scopes.split(' ').filter(Boolean),
      }).unwrap()
      setCreatedClient({ client_id: result.client_id, client_secret: result.client_secret })
      setName(''); setRedirectUri('')
      toast.success(t('create.success.string'))
    } catch {
      toast.error(t('create.error.string'))
    }
  }, [name, redirectUri, scopes, registerClient, t])

  const handleCopy = useCallback((field: 'id' | 'secret', value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setCreatedClient(null) }} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? t('form.cancel.string') : t('form.register.string')}
        </Button>
      </div>

      {/* Created client credentials (show once) */}
      {createdClient && (
        <Card className="mb-6 border-primary/50">
          <CardHeader>
            <CardTitle className="text-base">{t('credentials.title.string')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Client ID</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted p-2 text-xs font-mono">{createdClient.client_id}</code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy('id', createdClient.client_id)}>
                  {copied === 'id' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-destructive">Client Secret (save now — shown only once)</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted p-2 text-xs font-mono">{createdClient.client_secret}</code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy('secret', createdClient.client_secret)}>
                  {copied === 'secret' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Register form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t('form.title.string')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('form.name.string')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" />
            </div>
            <div className="space-y-2">
              <Label>{t('form.redirect_uris.string')}</Label>
              <Input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} placeholder="https://app.example.com/callback" />
              <p className="text-xs text-muted-foreground">{t('form.redirect_hint.string')}</p>
            </div>
            <div className="space-y-2">
              <Label>{t('form.scopes.string')}</Label>
              <Input value={scopes} onChange={(e) => setScopes(e.target.value)} placeholder="openid profile email" />
            </div>
            <Button onClick={handleRegister} disabled={registering}>
              <Key className="h-4 w-4 mr-1" /> {t('form.create.string')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Client list */}
      {isLoading ? <Skeleton className="h-40" /> : clients.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t('list.empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client: any) => (
            <Card key={client.client_id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span className="font-medium">{client.name}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Client ID:</span>
                    <code className="text-xs font-mono">{client.client_id}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Scopes:</span>
                    <div className="flex gap-1">
                      {client.scopes.map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
