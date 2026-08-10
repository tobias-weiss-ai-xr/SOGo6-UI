'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGetScimUsersQuery, useCreateScimUserMutation, useDeleteScimUserMutation } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { Users, UserPlus, Trash2 } from 'lucide-react'
import React, { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
export default function ScimProvisioningPage(): ReactNode {
  const t = useTranslations('SCIM')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const { data, refetch } = useGetScimUsersQuery(undefined, { pollingInterval: 30000 })
  const users = (data as any)?.Resources ?? []
  const [createUser, { isLoading: creating }] = useCreateScimUserMutation()
  const [deleteUser] = useDeleteScimUserMutation()
  const handleCreate = useCallback(async () => {
    if (!email) { toast.error(t('errors.email.string')); return }
    try { await createUser({ userName: email, displayName: name || email, emails: [{ value: email, primary: true }], active: true }).unwrap(); setEmail(''); setName(''); refetch(); toast.success(t('success.create.string')) }
    catch { toast.error(t('errors.fail.string')) }
  }, [email, name, createUser, refetch, t])
  const handleDelete = useCallback(async (uid: string) => {
    try { await deleteUser(uid).unwrap(); refetch(); toast.success(t('success.delete.string')) }
    catch { toast.error(t('errors.fail.string')) }
  }, [deleteUser, refetch, t])
  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> {t('title.string')}</h1><p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p></div>
      <Card className="mb-6"><CardContent className="pt-6"><div className="flex items-end gap-3"><div className="flex-1 grid gap-4 sm:grid-cols-2"><div><label className="text-xs text-muted-foreground">{t('field.email.string')}</label><Input value={email} onChange={e => setEmail(e.target.value)} /></div><div><label className="text-xs text-muted-foreground">{t('field.name.string')}</label><Input value={name} onChange={e => setName(e.target.value)} /></div></div><Button onClick={handleCreate} disabled={creating || !email}><UserPlus className="h-4 w-4 mr-1" /> {t('button.provision.string')}</Button></div></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">{t('users.title.string')}<Badge variant="outline" className="ml-2">{users.length}</Badge></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>{t('field.email.string')}</TableHead><TableHead>{t('field.name.string')}</TableHead><TableHead>{t('field.status.string')}</TableHead><TableHead></TableHead></TableRow></TableHeader><TableBody>{users.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t('users.empty.string')}</TableCell></TableRow> : users.map((u: any) => (<TableRow key={u.id}><TableCell className="font-mono text-xs">{u.id}</TableCell><TableCell>{u.userName}</TableCell><TableCell>{u.displayName}</TableCell><TableCell><Badge variant={u.active ? 'default' : 'secondary'}>{u.active ? 'Active' : 'Inactive'}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => handleDelete(u.userName)}><Trash2 className="h-3 w-3 text-destructive" /></Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  )
}
