'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListSharedDraftsQuery, useCreateSharedDraftMutation, useReviewSharedDraftMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { PenLine, Plus, X, ThumbsUp, ThumbsDown, Users, MessageSquare } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'

export default function SharedDraftsPage(): ReactNode {
  const t = useTranslations('AP_DRAFTS')
  const [showCreate, setShowCreate] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [reviewers, setReviewers] = useState('')
  const [message, setMessage] = useState('')

  const { data, isLoading, refetch } = useListSharedDraftsQuery()
  const [createDraft, { isLoading: creating }] = useCreateSharedDraftMutation()
  const [reviewDraft] = useReviewSharedDraftMutation()

  const drafts = data ?? []

  const handleCreate = useCallback(async () => {
    if (!subject || !body || !reviewers) {
      toast.error(t('errors.fields.string'))
      return
    }
    try {
      await createDraft({
        subject,
        body,
        recipients: reviewers.split(',').map(r => r.trim()).filter(Boolean),
        message,
      }).unwrap()
      toast.success(t('create.success.string'))
      setSubject(''); setBody(''); setReviewers(''); setMessage('')
      setShowCreate(false)
    } catch {
      toast.error(t('create.error.string'))
    }
  }, [subject, body, reviewers, message, createDraft, t])

  const handleReview = useCallback(async (draftId: string, approved: boolean) => {
    try {
      await reviewDraft({ draft_id: draftId, reviewer: 'admin', approved }).unwrap()
      toast.success(approved ? t('review.approved.string') : t('review.rejected.string'))
    } catch {
      toast.error(t('review.error.string'))
    }
  }, [reviewDraft, t])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} variant={showCreate ? 'outline' : 'default'}>
          {showCreate ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showCreate ? t('form.cancel.string') : t('form.share.string')}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">{t('form.title.string')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('form.subject.string')}</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('form.reviewers.string')}</Label>
              <Input value={reviewers} onChange={e => setReviewers(e.target.value)} placeholder="alice@example.org, bob@example.org" />
            </div>
            <div className="space-y-2">
              <Label>{t('form.message.string')}</Label>
              <Input value={message} onChange={e => setMessage(e.target.value)} placeholder={t('form.message_hint.string')} />
            </div>
            <div className="space-y-2">
              <Label>{t('form.body.string')}</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} rows={6} />
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              <PenLine className="h-4 w-4 mr-1" /> {t('form.submit.string')}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-40" /> : drafts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <PenLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t('list.empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft: any) => (
            <Card key={draft.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PenLine className="h-4 w-4 text-primary" />
                      <span className="font-medium truncate">{draft.subject}</span>
                      <Badge variant={
                        draft.status === 'approved' ? 'default' :
                        draft.status === 'rejected' ? 'destructive' : 'secondary'
                      } className={draft.status === 'approved' ? 'bg-green-600' : ''}>
                        {draft.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('list.by.string')}: {draft.author}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{draft.body}</p>

                    {/* Reviews */}
                    {draft.reviews?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {draft.reviews.map((r: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            {r.approved ? <ThumbsUp className="h-3 w-3 text-green-600" /> : <ThumbsDown className="h-3 w-3 text-red-600" />}
                            <span>{r.reviewer}</span>
                            {r.comment && <span className="italic">— {r.comment}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {draft.status === 'pending' && (
                    <div className="flex gap-1 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleReview(draft.id, true)}>
                        <ThumbsUp className="h-3 w-3 mr-1" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReview(draft.id, false)}>
                        <ThumbsDown className="h-3 w-3 mr-1" />
                      </Button>
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
