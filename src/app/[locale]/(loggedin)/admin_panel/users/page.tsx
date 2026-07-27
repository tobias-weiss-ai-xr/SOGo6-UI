'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'

type UserRecord = {
  uid?: string[]
  cn?: string[]
  sn?: string[]
  givenName?: string[]
  mail?: string[]
  uidNumber?: string[]
  gidNumber?: string[]
  homeDirectory?: string[]
}

function val(list: string[] | undefined): string {
  return (list && list[0]) ?? ''
}

export default function UsersPage(): ReactNode {
  const t = useTranslations('')
  const ts = useTranslations('AP_USERS')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // List users
  const { data: rawData, isLoading, isFetching, error } = useListUsersQuery(
    searchQuery ? { query: searchQuery } : undefined,
  )

  const users: UserRecord[] = (rawData as unknown as { data?: UserRecord[] })?.data ?? []

  // Create user mutation
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  // Dialog state
  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null)

  // Form state (create)
  const [formUid, setFormUid] = useState('')
  const [formCn, setFormCn] = useState('')
  const [formSn, setFormSn] = useState('')
  const [formGivenName, setFormGivenName] = useState('')
  const [formMail, setFormMail] = useState('')
  const [formPassword, setFormPassword] = useState('')

  // Form state (edit)
  const [editCn, setEditCn] = useState('')
  const [editSn, setEditSn] = useState('')
  const [editGivenName, setEditGivenName] = useState('')
  const [editMail, setEditMail] = useState('')
  const [editPassword, setEditPassword] = useState('')

  // Reset create form
  const resetCreateForm = useCallback(() => {
    setFormUid('')
    setFormCn('')
    setFormSn('')
    setFormGivenName('')
    setFormMail('')
    setFormPassword('')
  }, [])

  // Handle create
  const handleCreate = useCallback(async () => {
    try {
      await createUser({
        uid: formUid,
        cn: formCn,
        sn: formSn,
        givenName: formGivenName,
        mail: formMail,
        password: formPassword,
      }).unwrap()
      toast.success(ts('create.success.string'))
      setShowCreate(false)
      resetCreateForm()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
          : ''
      toast.error(`${ts('create.error.string')}${msg ? `: ${msg}` : ''}`)
    }
  }, [createUser, formUid, formCn, formSn, formGivenName, formMail, formPassword, ts, resetCreateForm])

  // Handle edit dialog open
  const openEdit = useCallback((user: UserRecord) => {
    setEditingUser(user)
    setEditCn(val(user.cn))
    setEditSn(val(user.sn))
    setEditGivenName(val(user.givenName))
    setEditMail(val(user.mail))
    setEditPassword('')
  }, [])

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!editingUser) return
    const uid = val(editingUser.uid)
    try {
      await updateUser({
        uid,
        body: {
          cn: editCn || undefined,
          sn: editSn || undefined,
          givenName: editGivenName || undefined,
          mail: editMail || undefined,
          password: editPassword || undefined,
        },
      }).unwrap()
      toast.success(ts('edit.success.string'))
      setEditingUser(null)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
          : ''
      toast.error(`${ts('edit.error.string')}${msg ? `: ${msg}` : ''}`)
    }
  }, [editingUser, updateUser, editCn, editSn, editGivenName, editMail, editPassword, ts])

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!deletingUser) return
    const uid = val(deletingUser.uid)
    try {
      await deleteUser(uid).unwrap()
      toast.success(ts('delete.success.string'))
      setDeletingUser(null)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
          : ''
      toast.error(`${ts('delete.error.string')}${msg ? `: ${msg}` : ''}`)
    }
  }, [deletingUser, deleteUser, ts])

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {ts('title.string')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ts('description.string')}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={ts('search.placeholder.string')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {ts('create.button.string')}
        </Button>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive text-center py-8">
          {String(error)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          {ts('table.no_users.string')}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ts('table.uid.string')}</TableHead>
                <TableHead>{ts('table.cn.string')}</TableHead>
                <TableHead>{ts('table.mail.string')}</TableHead>
                <TableHead>{ts('table.uidNumber.string')}</TableHead>
                <TableHead className="w-[120px]">{ts('table.actions.string')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={val(user.uid)}>
                  <TableCell className="font-medium">{val(user.uid)}</TableCell>
                  <TableCell>{val(user.cn)}</TableCell>
                  <TableCell>{val(user.mail)}</TableCell>
                  <TableCell>{val(user.uidNumber)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(user)}
                        title={ts('edit.button.string')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingUser(user)}
                        title={ts('delete.button.string')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetCreateForm() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ts('create.title.string')}</DialogTitle>
            <DialogDescription>
              {ts('description.string')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{ts('form.uid.string')} *</Label>
              <Input value={formUid} onChange={(e) => setFormUid(e.target.value)} placeholder="user@example.org" />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.cn.string')} *</Label>
              <Input value={formCn} onChange={(e) => setFormCn(e.target.value)} placeholder="Full Name" />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.sn.string')} *</Label>
              <Input value={formSn} onChange={(e) => setFormSn(e.target.value)} placeholder="Surname" />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.givenName.string')} *</Label>
              <Input value={formGivenName} onChange={(e) => setFormGivenName(e.target.value)} placeholder="Given Name" />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.mail.string')} *</Label>
              <Input value={formMail} onChange={(e) => setFormMail(e.target.value)} placeholder="user@example.org" />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.password.string')} *</Label>
              <Input value={formPassword} onChange={(e) => setFormPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetCreateForm() }}>
              {t('AP_SESSIONS.cancel.string') || 'Cancel'}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !formUid || !formCn || !formMail || !formPassword}>
              {ts('create.button.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ts('edit.title.string')}</DialogTitle>
            <DialogDescription>
              {val(editingUser?.uid)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{ts('form.cn.string')}</Label>
              <Input value={editCn} onChange={(e) => setEditCn(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.sn.string')}</Label>
              <Input value={editSn} onChange={(e) => setEditSn(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.givenName.string')}</Label>
              <Input value={editGivenName} onChange={(e) => setEditGivenName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.mail.string')}</Label>
              <Input value={editMail} onChange={(e) => setEditMail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.password.string')}</Label>
              <Input value={editPassword} onChange={(e) => setEditPassword(e.target.value)} type="password" placeholder="Leave empty to keep current" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              {t('AP_SESSIONS.cancel.string') || 'Cancel'}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {ts('edit.save.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => { if (!open) setDeletingUser(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{ts('delete.button.string')}</DialogTitle>
            <DialogDescription>
              {ts('delete.confirm.string', { uid: val(deletingUser?.uid) })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              {t('AP_SESSIONS.cancel.string') || 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {ts('delete.button.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
