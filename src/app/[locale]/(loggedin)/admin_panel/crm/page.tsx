'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListCrmAccountsQuery, useCreateCrmAccountMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Building2, Plus, X, Users, Globe } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function CrmPage(): ReactNode {
  const t = useTranslations('AP_CRM')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [industry, setIndustry] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useListCrmAccountsQuery()
  const [createAccount, { isLoading: creating }] = useCreateCrmAccountMutation()

  const accounts = data ?? []

  const handleCreate = useCallback(async () => {
    if (!name) { toast.error(t('errors.fields.string')); return }
    try {
      await createAccount({ name, domain, industry, notes }).unwrap()
      toast.success(t('create.success.string'))
      setName(''); setDomain(''); setIndustry(''); setNotes('')
      setShowCreate(false)
    } catch { toast.error(t('create.error.string')) }
  }, [name, domain, industry, notes, createAccount, t])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} variant={showCreate ? 'outline' : 'default'}>
          {showCreate ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreate ? t('form.cancel.string') : t('form.create.string')}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">{t('form.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{t('form.name.string')}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('form.domain.string')}</Label><Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="acme.com" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{t('form.industry.string')}</Label><Input value={industry} onChange={e => setIndustry(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('form.notes.string')}</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
            </div>
            <Button onClick={handleCreate} disabled={creating}><Building2 className="h-4 w-4 mr-1" /> {t('form.submit.string')}</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : accounts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12"><Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>{t('list.empty.string')}</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc: any) => (
            <Card key={acc.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-medium">{acc.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{acc.id}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {acc.domain && <div className="flex items-center gap-1"><Globe className="h-3 w-3" /> {acc.domain}</div>}
                  {acc.industry && <Badge variant="outline" className="text-xs">{acc.industry}</Badge>}
                </div>
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> {acc.contacts?.length ?? 0} contacts
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
