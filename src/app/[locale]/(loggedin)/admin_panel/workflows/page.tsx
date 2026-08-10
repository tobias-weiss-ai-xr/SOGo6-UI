'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListWorkflowsQuery, useCreateWorkflowMutation, useToggleWorkflowMutation, useDeleteWorkflowMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Workflow, Plus, X, Trash2, Play, Pause, Zap } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

const TRIGGER_TYPES = ['email_received', 'calendar_event', 'user_created']
const ACTION_TYPES = ['forward', 'move', 'label', 'create_event', 'notify', 'archive']
const OPERATORS = ['equals', 'contains', 'starts_with', 'not_equals']

export default function WorkflowBuilderPage(): ReactNode {
  const t = useTranslations('AP_WORKFLOWS')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState('email_received')
  const [conditions, setConditions] = useState<Array<{ field: string; operator: string; value: string }>>([
    { field: 'from', operator: 'equals', value: '' },
  ])
  const [actions, setActions] = useState<Array<{ type: string; params: Record<string, string> }>>([
    { type: 'forward', params: { to: '' } },
  ])

  const { data, isLoading } = useListWorkflowsQuery()
  const [createWorkflow, { isLoading: creating }] = useCreateWorkflowMutation()
  const [toggleWorkflow] = useToggleWorkflowMutation()
  const [deleteWorkflow] = useDeleteWorkflowMutation()

  const workflows = data ?? []

  const addCondition = useCallback(() => setConditions(prev => [...prev, { field: '', operator: 'equals', value: '' }]), [])
  const updateCondition = useCallback((idx: number, field: string, value: string) => {
    setConditions(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }, [])
  const removeCondition = useCallback((idx: number) => setConditions(prev => prev.filter((_, i) => i !== idx)), [])

  const addAction = useCallback(() => setActions(prev => [...prev, { type: 'forward', params: { to: '' } }]), [])
  const updateAction = useCallback((idx: number, field: string, value: string) => {
    setActions(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a))
  }, [])
  const updateActionParam = useCallback((idx: number, key: string, value: string) => {
    setActions(prev => prev.map((a, i) => i === idx ? { ...a, params: { ...a.params, [key]: value } } : a))
  }, [])
  const removeAction = useCallback((idx: number) => setActions(prev => prev.filter((_, i) => i !== idx)), [])

  const handleCreate = useCallback(async () => {
    if (!name || conditions.length === 0 || actions.length === 0) { toast.error(t('errors.fields.string')); return }
    try {
      await createWorkflow({
        name, description, trigger_type: triggerType,
        conditions: conditions.filter(c => c.field && c.value),
        actions: actions.filter(a => a.type),
        enabled: true,
      }).unwrap()
      toast.success(t('create.success.string'))
      setName(''); setDescription('')
      setConditions([{ field: 'from', operator: 'equals', value: '' }])
      setActions([{ type: 'forward', params: { to: '' } }])
      setShowCreate(false)
    } catch { toast.error(t('create.error.string')) }
  }, [name, description, triggerType, conditions, actions, createWorkflow, t])

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    try { await toggleWorkflow({ workflow_id: id, enabled }).unwrap() }
    catch { toast.error(t('toggle.error.string')) }
  }, [toggleWorkflow, t])

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteWorkflow(id).unwrap(); toast.success(t('delete.success.string')) }
    catch { toast.error(t('delete.error.string')) }
  }, [deleteWorkflow, t])

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
              <div className="space-y-2"><Label>{t('form.trigger.string')}</Label>
                <select value={triggerType} onChange={e => setTriggerType(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3">
                  {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>{t('form.description.string')}</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('form.conditions.string')}</Label>
                <Button variant="outline" size="sm" onClick={addCondition}><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              {conditions.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-6">IF</span>
                  <Input value={c.field} onChange={e => updateCondition(idx, 'field', e.target.value)} placeholder="field" className="flex-1" />
                  <select value={c.operator} onChange={e => updateCondition(idx, 'operator', e.target.value)} className="w-28 h-9 rounded border bg-background px-2 text-xs">
                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <Input value={c.value} onChange={e => updateCondition(idx, 'value', e.target.value)} placeholder="value" className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => removeCondition(idx)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('form.actions.string')}</Label>
                <Button variant="outline" size="sm" onClick={addAction}><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              {actions.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-6">THEN</span>
                  <select value={a.type} onChange={e => updateAction(idx, 'type', e.target.value)} className="w-32 h-9 rounded border bg-background px-2 text-xs">
                    {ACTION_TYPES.map(at => <option key={at} value={at}>{at}</option>)}
                  </select>
                  <Input value={a.params.to || ''} onChange={e => updateActionParam(idx, 'to', e.target.value)} placeholder="param value" className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => removeAction(idx)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>

            <Button onClick={handleCreate} disabled={creating}><Workflow className="h-4 w-4 mr-1" /> {t('form.submit.string')}</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : workflows.length === 0 ? (
        <div className="text-center text-muted-foreground py-12"><Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>{t('list.empty.string')}</p></div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf: any) => (
            <Card key={wf.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-primary" />
                      <span className="font-medium">{wf.name}</span>
                      <Badge variant="outline">{wf.trigger_type}</Badge>
                      <Badge variant={wf.enabled ? 'default' : 'secondary'} className={wf.enabled ? 'bg-green-600' : ''}>
                        {wf.enabled ? 'active' : 'disabled'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {wf.conditions?.length ?? 0} conditions · {wf.actions?.length ?? 0} actions · {wf.trigger_count ?? 0} executions
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(wf.id, !wf.enabled)}>
                      {wf.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(wf.id)} className="text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
