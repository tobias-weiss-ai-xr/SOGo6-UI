'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useListUsersQuery, useGetUserQuotaQuery, useSetUserQuotaMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { HardDrive, Users, Calendar, Contact, RefreshCw, Save } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

function ProgressBar({ used, total, label }: { used: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const isOver = pct > 90
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">{label}</span>
        <span className={isOver ? 'text-destructive font-medium' : 'text-muted-foreground'}>
          {used.toFixed(1)} / {total === 0 ? '∞' : `${total}`} MB
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: total > 0 ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  )
}

export default function QuotasPage(): ReactNode {
  const t = useTranslations('AP_QUOTAS')
  const [selectedUid, setSelectedUid] = useState('')
  const [mailboxLimit, setMailboxLimit] = useState('')
  const [calendarLimit, setCalendarLimit] = useState('')
  const [contactLimit, setContactLimit] = useState('')

  const { data: users = [], isLoading: usersLoading } = useListUsersQuery()
  const { data: quotaData, isLoading: quotaLoading } = useGetUserQuotaQuery(selectedUid, { skip: !selectedUid })
  const [setQuota] = useSetUserQuotaMutation()

  const quota = quotaData ?? null

  const handleSave = useCallback(async () => {
    if (!selectedUid) return
    try {
      await setQuota({
        user_uid: selectedUid,
        mailbox_size_mb: mailboxLimit ? parseInt(mailboxLimit, 10) : undefined,
        calendar_count: calendarLimit ? parseInt(calendarLimit, 10) : undefined,
        contact_count: contactLimit ? parseInt(contactLimit, 10) : undefined,
      }).unwrap()
      toast.success(t('save.success.string'))
    } catch {
      toast.error(t('save.error.string'))
    }
  }, [selectedUid, mailboxLimit, calendarLimit, contactLimit, setQuota, t])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> {t('select_user.string')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedUid}
              onChange={(e) => {
                setSelectedUid(e.target.value)
                setMailboxLimit('')
                setCalendarLimit('')
                setContactLimit('')
              }}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">{t('select_placeholder.string')}</option>
              {users.map((u: any) => (
                <option key={u.uid || u.mail} value={u.uid || u.mail}>
                  {u.cn || u.uid} ({u.mail})
                </option>
              ))}
            </select>

            {quota && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">{t('current_usage.string')}</h3>
                <ProgressBar
                  used={quota.mailbox_used_mb}
                  total={quota.mailbox_size_mb}
                  label={t('labels.mailbox.string')}
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('labels.calendars.string')}</span>
                    <p className="font-medium">{quota.calendar_used} / {quota.calendar_count || '∞'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('labels.contacts.string')}</span>
                    <p className="font-medium">{quota.contact_used} / {quota.contact_count || '∞'}</p>
                  </div>
                </div>
              </div>
            )}

            {quotaLoading && <Skeleton className="h-20" />}
          </CardContent>
        </Card>

        {/* Quota settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4" /> {t('set_quota.string')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('labels.mailbox_limit.string')}</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} value={mailboxLimit} onChange={(e) => setMailboxLimit(e.target.value)} placeholder="0 = unlimited" className="max-w-[200px]" />
                <span className="text-sm text-muted-foreground">MB</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('labels.calendar_limit.string')}</Label>
              <Input type="number" min={0} value={calendarLimit} onChange={(e) => setCalendarLimit(e.target.value)} placeholder="0 = unlimited" className="max-w-[200px]" />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.contact_limit.string')}</Label>
              <Input type="number" min={0} value={contactLimit} onChange={(e) => setContactLimit(e.target.value)} placeholder="0 = unlimited" className="max-w-[200px]" />
            </div>
            <Button onClick={handleSave} disabled={!selectedUid} className="mt-2">
              <Save className="h-4 w-4 mr-1" />
              {t('save.button.string')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
