'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListTicketsQuery, useCreateTicketMutation, useUpdateTicketMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Ticket, Plus, X, Clock, AlertTriangle } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

const priorityColors: Record<string, string> = { low: '', medium: 'bg-yellow-600', high: 'bg-orange-600', urgent: 'bg-red-600' }
const statusColors: Record<string, string> = { open: '', in_progress: 'bg-blue-600', waiting: 'bg-yellow-600', resolved: 'bg-green-600', closed: '' }

export default function HelpdeskPage(): ReactNode {
  const t = useTranslations('AP_HELPDESK')
  const [showCreate, setShowCreate] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [requester, setRequester] = useState('')
  const [assignee, setAssignee] = useState('')
  const [slaHours, setSlaHours] = useState('48')

  const { data, isLoading } = useListTicketsQuery()
  const [createTicket, { isLoading: creating }] = useCreateTicketMutation()
  const [updateTicket] = useUpdateTicketMutation()

  const tickets = data ?? []

  const handleCreate = useCallback(async () => {
    if (!subject || !description) { toast.error(t('errors.fields.string')); return }
    try {
      await createTicket({ subject, description, priority, requester_email: requester, assignee_email: assignee, sla_hours: parseInt(slaHours) }).unwrap()
      toast.success(t('create.success.string'))
      setSubject(''); setDescription(''); setRequester(''); setAssignee('')
      setShowCreate(false)
    } catch { toast.error(t('create.error.string')) }
  }, [subject, description, priority, requester, assignee, slaHours, createTicket, t])

  const handleStatusChange = useCallback(async (ticketId: string, status: string) => {
    try {
      await updateTicket({ ticket_id: ticketId, status }).unwrap()
      toast.success(t('update.success.string'))
    } catch { toast.error(t('update.error.string')) }
  }, [updateTicket, t])

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
              <div className="space-y-2"><Label>{t('form.subject.string')}</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('form.priority.string')}</Label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>{t('form.description.string')}</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>{t('form.requester.string')}</Label><Input value={requester} onChange={e => setRequester(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('form.assignee.string')}</Label><Input value={assignee} onChange={e => setAssignee(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('form.sla.string')}</Label><Input type="number" value={slaHours} onChange={e => setSlaHours(e.target.value)} /></div>
            </div>
            <Button onClick={handleCreate} disabled={creating}><Ticket className="h-4 w-4 mr-1" /> {t('form.submit.string')}</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : tickets.length === 0 ? (
        <div className="text-center text-muted-foreground py-12"><Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>{t('list.empty.string')}</p></div>
      ) : (
        <div className="space-y-3">
          {tickets.map((tk: any) => (
            <Card key={tk.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{tk.id}</span>
                      <span className="font-medium">{tk.subject}</span>
                      <Badge variant="secondary" className={priorityColors[tk.priority]}>{tk.priority}</Badge>
                      <Badge variant="secondary" className={statusColors[tk.status]}>{tk.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{tk.requester_email}</span>
                      {tk.assignee_email && <span>→ {tk.assignee_email}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> SLA: {tk.sla_hours}h</span>
                    </div>
                  </div>
                  <select
                    value={tk.status}
                    onChange={e => handleStatusChange(tk.id, e.target.value)}
                    className="h-8 text-xs rounded border bg-background px-2"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
