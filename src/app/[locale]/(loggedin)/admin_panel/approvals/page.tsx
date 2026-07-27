'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListApprovalsQuery, useCreateApprovalMutation, useActionApprovalMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { GitBranch, Plus, X, Check, XCircle, MessageSquare } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function ApprovalWorkflowsPage(): ReactNode {
  const t = useTranslations('AP_APPROVALS')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [steps, setSteps] = useState<Array<{ email: string; role: string }>>([
    { email: '', role: 'manager' },
  ])

  const { data, isLoading } = useListApprovalsQuery()
  const [createApproval, { isLoading: creating }] = useCreateApprovalMutation()
  const [actionApproval] = useActionApprovalMutation()

  const approvals = data ?? []

  const addStep = useCallback(() => setSteps(prev => [...prev, { email: '', role: 'reviewer' }]), [])
  const updateStep = useCallback((idx: number, field: string, value: string) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }, [])
  const removeStep = useCallback((idx: number) => setSteps(prev => prev.filter((_, i) => i !== idx)), [])

  const handleCreate = useCallback(async () => {
    if (!title || steps.length === 0 || steps.some(s => !s.email)) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      await createApproval({
        title, description, category,
        steps: steps.map(s => ({ [s.email]: s.role })),
      }).unwrap()
      toast.success(t('create.success.string'))
      setTitle(''); setDescription(''); setCategory('general')
      setSteps([{ email: '', role: 'manager' }])
      setShowCreate(false)
    } catch { toast.error(t('create.error.string')) }
  }, [title, description, category, steps, createApproval, t])

  const handleAction = useCallback(async (id: string, action: string) => {
    try {
      await actionApproval({ approval_id: id, action }).unwrap()
      toast.success(action === 'approve' ? t('action.approved.string') : t('action.rejected.string'))
    } catch { toast.error(t('action.error.string')) }
  }, [actionApproval, t])

  const statusColor = (s: string) => s === 'approved' ? 'bg-green-600' : s === 'rejected' ? 'bg-red-600' : s === 'in_review' ? 'bg-blue-600' : ''

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
              <div className="space-y-2"><Label>{t('form.workflow_title.string')}</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('form.category.string')}</Label><Input value={category} onChange={e => setCategory(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>{t('form.description.string')}</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>{t('form.steps.string')}</Label><Button variant="outline" size="sm" onClick={addStep}><Plus className="h-3 w-3 mr-1" /> Add Step</Button></div>
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Badge variant="outline">Step {idx + 1}</Badge>
                  <Input value={step.email} onChange={e => updateStep(idx, 'email', e.target.value)} placeholder="approver@example.org" className="flex-1" />
                  <Input value={step.role} onChange={e => updateStep(idx, 'role', e.target.value)} className="w-32" />
                  <Button variant="ghost" size="sm" onClick={() => removeStep(idx)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
            <Button onClick={handleCreate} disabled={creating}><GitBranch className="h-4 w-4 mr-1" /> {t('form.submit.string')}</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : approvals.length === 0 ? (
        <div className="text-center text-muted-foreground py-12"><GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>{t('list.empty.string')}</p></div>
      ) : (
        <div className="space-y-3">
          {approvals.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-primary" />
                      <span className="font-medium">{a.title}</span>
                      <Badge variant="secondary" className={statusColor(a.status)}>{a.status}</Badge>
                      <Badge variant="outline">{a.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Step {a.current_step + 1} of {a.steps?.length ?? 0} · {a.history?.length ?? 0} actions</p>
                  </div>
                  {(a.status === 'pending' || a.status === 'in_review') && (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleAction(a.id, 'approve')}><Check className="h-3 w-3 mr-1" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleAction(a.id, 'reject')}><XCircle className="h-3 w-3 mr-1" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
