'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListWebhooksQuery, useCreateWebhookMutation, useDeleteWebhookMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Webhook, Plus, Trash2, X, Zap } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

const VALID_EVENTS = [
  'mail.received', 'mail.sent', 'mail.deleted',
  'calendar.created', 'calendar.updated', 'calendar.deleted',
  'contact.created', 'contact.updated', 'contact.deleted',
  'user.created', 'user.updated', 'user.deleted',
]

export default function WebhooksPage(): ReactNode {
  const t = useTranslations('AP_WEBHOOKS')
  const [showForm, setShowForm] = useState(false)
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [secret, setSecret] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const { data, isLoading, refetch } = useListWebhooksQuery()
  const [createWebhook, { isLoading: creating }] = useCreateWebhookMutation()
  const [deleteWebhook] = useDeleteWebhookMutation()

  const webhooks = data ?? []

  const toggleEvent = useCallback((event: string) => {
    setSelectedEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event])
  }, [])

  const handleCreate = useCallback(async () => {
    if (!url || selectedEvents.length === 0) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      await createWebhook({ url, events: selectedEvents, secret, name }).unwrap()
      toast.success(t('create.success.string'))
      setUrl(''); setName(''); setSecret(''); setSelectedEvents([])
      setShowForm(false)
    } catch {
      toast.error(t('create.error.string'))
    }
  }, [url, name, secret, selectedEvents, createWebhook, t])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteWebhook(id).unwrap()
      toast.success(t('delete.success.string'))
    } catch {
      toast.error(t('delete.error.string'))
    }
  }, [deleteWebhook, t])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'}>
          {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? t('form.cancel.string') : t('form.add.string')}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t('form.title.string')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('form.url.string')}</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.n8n.io/webhook/..." />
              </div>
              <div className="space-y-2">
                <Label>{t('form.name.string')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('form.name_placeholder.string')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('form.secret.string')}</Label>
              <Input value={secret} onChange={(e) => setSecret(e.target.value)} type="password" placeholder={t('form.secret_placeholder.string')} />
            </div>
            <div className="space-y-2">
              <Label>{t('form.events.string')}</Label>
              <div className="flex flex-wrap gap-2">
                {VALID_EVENTS.map(event => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedEvents.includes(event) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              <Webhook className="h-4 w-4 mr-1" /> {t('form.create.string')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? <Skeleton className="h-40" /> : webhooks.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t('list.empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((hook: any) => (
            <Card key={hook.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{hook.name || hook.url}</span>
                      <Badge variant={hook.enabled !== false ? 'default' : 'secondary'} className={hook.enabled !== false ? 'bg-green-600' : ''}>
                        {hook.enabled !== false ? 'active' : 'disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono truncate mt-1">{hook.url}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hook.events.map((e: string) => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(hook.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
