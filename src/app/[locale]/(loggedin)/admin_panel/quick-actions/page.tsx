'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListQuickActionsQuery, useCreateQuickActionMutation, useDeleteQuickActionMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Zap, Plus, X, Trash2, ArrowRight } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

const STEP_TYPES = ['label', 'move', 'forward', 'tag', 'archive', 'snooze']

export default function QuickActionsPage(): ReactNode {
  const t = useTranslations('AP_QUICK')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('zap')
  const [steps, setSteps] = useState<Array<{ type: string; params: Record<string, string> }>>([
    { type: 'label', params: { value: '' } },
  ])

  const { data, isLoading } = useListQuickActionsQuery()
  const [createAction, { isLoading: creating }] = useCreateQuickActionMutation()
  const [deleteAction] = useDeleteQuickActionMutation()

  const actions = data ?? []

  const addStep = useCallback(() => setSteps(prev => [...prev, { type: 'label', params: { value: '' } }]), [])
  const updateStep = useCallback((idx: number, field: string, value: string) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }, [])
  const updateStepParam = useCallback((idx: number, key: string, value: string) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, params: { ...s.params, [key]: value } } : s))
  }, [])
  const removeStep = useCallback((idx: number) => setSteps(prev => prev.filter((_, i) => i !== idx)), [])

  const handleCreate = useCallback(async () => {
    if (!name || steps.length === 0) { toast.error(t('errors.fields.string')); return }
    try {
      await createAction({ name, icon, steps: steps.filter(s => s.type) }).unwrap()
      toast.success(t('create.success.string'))
      setName(''); setIcon('zap')
      setSteps([{ type: 'label', params: { value: '' } }])
      setShowCreate(false)
    } catch { toast.error(t('create.error.string')) }
  }, [name, icon, steps, createAction, t])

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteAction(id).unwrap(); toast.success(t('delete.success.string')) }
    catch { toast.error(t('delete.error.string')) }
  }, [deleteAction, t])

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
              <div className="space-y-2"><Label>{t('form.name.string')}</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Auto-archive & Label" /></div>
              <div className="space-y-2"><Label>{t('form.icon.string')}</Label><Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="lucide icon name" /></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>{t('form.steps.string')}</Label><Button variant="outline" size="sm" onClick={addStep}><Plus className="h-3 w-3 mr-1" /> Add Step</Button></div>
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select value={step.type} onChange={e => updateStep(idx, 'type', e.target.value)} className="w-28 h-9 rounded border bg-background px-2 text-xs">
                    {STEP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Input value={step.params.value || ''} onChange={e => updateStepParam(idx, 'value', e.target.value)} placeholder="value" className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => removeStep(idx)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
            <Button onClick={handleCreate} disabled={creating}><Zap className="h-4 w-4 mr-1" /> {t('form.submit.string')}</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : actions.length === 0 ? (
        <div className="text-center text-muted-foreground py-12"><Zap className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>{t('list.empty.string')}</p></div>
      ) : (
        <div className="space-y-3">
          {actions.map((action: any) => (
            <Card key={action.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-sm">{action.name}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {action.steps?.map((s: any, i: number) => (
                          <React.Fragment key={i}>
                            <Badge variant="outline" className="text-xs">{s.type}</Badge>
                            {i < action.steps.length - 1 && <ArrowRight className="h-2 w-2 text-muted-foreground" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(action.id)} className="text-destructive">
                    <Trash2 className="h-3 w-3" />
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
