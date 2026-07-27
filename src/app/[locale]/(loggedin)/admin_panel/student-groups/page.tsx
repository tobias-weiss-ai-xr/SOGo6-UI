'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useListStudentGroupsQuery, useCreateStudentGroupMutation, useEnrollStudentsMutation, useDropStudentsMutation, useDeleteStudentGroupMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { GraduationCap, Plus, Users, Trash2 } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function StudentGroupsPage(): ReactNode {
  const t = useTranslations('STUDENT_GROUPS')
  const [name, setName] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const { data, refetch } = useListStudentGroupsQuery(undefined, { pollingInterval: 15000 })
  const groups = (data as any)?.data ?? []
  const [createGroup, { isLoading: creating }] = useCreateStudentGroupMutation()
  const [enroll] = useEnrollStudentsMutation()
  const [drop] = useDropStudentsMutation()
  const [deleteGroup] = useDeleteStudentGroupMutation()
  const handleCreate = useCallback(async () => {
    if (!name) { toast.error(t('errors.name.string')); return }
    try { await createGroup({ name, course_code: courseCode }).unwrap(); setName(''); setCourseCode(''); refetch(); toast.success(t('success.create.string')) } catch { toast.error(t('errors.fail.string')) }
  }, [name, courseCode, createGroup, refetch, t])
  const handleDelete = useCallback(async (id: string) => {
    try { await deleteGroup(id).unwrap(); refetch() } catch { toast.error(t('errors.fail.string')) }
  }, [deleteGroup, refetch, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <Card className="mb-6"><CardContent className="pt-6"><div className="flex items-end gap-3"><div className="flex-1 grid gap-4 sm:grid-cols-2"><div><label className="text-xs text-muted-foreground">{t('field.name.string')}</label><Input value={name} onChange={e => setName(e.target.value)} /></div><div><label className="text-xs text-muted-foreground">{t('field.course.string')}</label><Input value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="CS101" /></div></div><Button onClick={handleCreate} disabled={creating || !name}><Plus className="h-4 w-4 mr-1" /> {t('button.create.string')}</Button></div></CardContent></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{groups.map((g: any) => (<Card key={g.id}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">{g.name}</CardTitle><Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button></CardHeader><CardContent><div className="space-y-2 text-sm"><div className="flex items-center gap-2"><Badge variant="outline">{g.course_code || t('label.none.string')}</Badge><Badge variant="outline">{g.semester || t('label.none.string')}</Badge></div><div className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" /><span>{g.member_count ?? 0} {t('label.students.string')}</span></div><div className="text-xs text-muted-foreground font-mono truncate">{g.mailing_list}</div></div></CardContent></Card>))}</div>
    </div>
  )
}
