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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useListSharedMailboxesQuery,
  useCreateSharedMailboxMutation,
  useUpdateSharedMailboxMutation,
  useDeleteSharedMailboxMutation,
  useGetSharedMailboxMembersQuery,
  useAddSharedMailboxMemberMutation,
  useRemoveSharedMailboxMemberMutation,
  type SharedMailbox,
} from '@/features/admin-panel/store/admin-panel-api'
import { useListUsersQuery } from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { ReactNode, useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Users,
  Mail,
  UserPlus,
  UserMinus,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

type UserRecord = {
  uid?: string[]
  cn?: string[]
  mail?: string[]
}

function val(list: string[] | undefined): string {
  return (list && list[0]) ?? ''
}

function getUserDisplayName(user: UserRecord): string {
  return val(user.cn) || val(user.uid) || val(user.mail)
}

function getUserId(user: UserRecord): string {
  return val(user.uid)
}

function getUserEmail(user: UserRecord): string {
  return val(user.mail)
}

export default function SharedMailboxesPage(): ReactNode {
  const t = useTranslations('AP_SHARED_MAILBOXES')

  // Shared Mailbox Queries
  const {
    data: mailboxesData,
    isLoading: mailboxesLoading,
    isFetching: mailboxesFetching,
    error: mailboxesError,
    refetch: refetchMailboxes,
  } = useListSharedMailboxesQuery()

  const [createSharedMailbox, { isLoading: isCreating }] = useCreateSharedMailboxMutation()
  const [updateSharedMailbox, { isLoading: isUpdating }] = useUpdateSharedMailboxMutation()
  const [deleteSharedMailbox, { isLoading: isDeleting }] = useDeleteSharedMailboxMutation()
  const [addMember] = useAddSharedMailboxMemberMutation()
  const [removeMember] = useRemoveSharedMailboxMemberMutation()

  // User Queries (for member selection)
  const {
    data: usersData,
    isLoading: usersLoading,
  } = useListUsersQuery()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [selectedMailbox, setSelectedMailbox] = useState<SharedMailbox | null>(null)

  // Form State for Create/Edit
  const [formEmail, setFormEmail] = useState('')
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  // Member management state
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<UserRecord[]>([])

  // Extract data
  const mailboxes: SharedMailbox[] = mailboxesData?.mailboxes ?? []
  const users: UserRecord[] = (usersData as unknown as { data?: UserRecord[] })?.data ?? []

  // Get members for selected mailbox
  const { data: selectedMailboxMembers } = useGetSharedMailboxMembersQuery(
    selectedMailbox?.id ?? '',
    { skip: !selectedMailbox?.id || !showMembersDialog }
  )

  const currentMembers: string[] = selectedMailboxMembers ?? []

  // Filter mailboxes
  const filteredMailboxes = mailboxes.filter(
    (mb) =>
      mb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mb.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mb.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter users for member selection
  const filteredUsers = users.filter(
    (u) =>
      getUserDisplayName(u).toLowerCase().includes(memberSearch.toLowerCase()) ||
      getUserEmail(u).toLowerCase().includes(memberSearch.toLowerCase())
  )

  const availableUsers = filteredUsers.filter(
    (u) => !currentMembers.includes(getUserId(u))
  )

  // Handlers
  const handleCreate = async () => {
    if (!formEmail || !formName) {
      toast.error(t('error.requiredFields'))
      return
    }

    try {
      await createSharedMailbox({
        email: formEmail,
        name: formName,
        description: formDescription || undefined,
        member_uids: selectedUsersToAdd.map(getUserId),
      }).unwrap()

      toast.success(t('createSuccess'))
      setShowCreateDialog(false)
      resetForm()
      refetchMailboxes()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.createFailed'))
    }
  }

  const handleUpdate = async () => {
    if (!selectedMailbox || !formName) {
      toast.error(t('error.requiredFields'))
      return
    }

    try {
      await updateSharedMailbox({
        mailboxId: selectedMailbox.id,
        name: formName,
        description: formDescription || undefined,
        is_active: formIsActive,
      }).unwrap()

      toast.success(t('updateSuccess'))
      setShowEditDialog(false)
      resetForm()
      setSelectedMailbox(null)
      refetchMailboxes()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.updateFailed'))
    }
  }

  const handleDelete = async () => {
    if (!selectedMailbox) return

    try {
      await deleteSharedMailbox(selectedMailbox.id).unwrap()
      toast.success(t('deleteSuccess'))
      setShowDeleteDialog(false)
      setSelectedMailbox(null)
      refetchMailboxes()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.deleteFailed'))
    }
  }

  const handleAddMember = async (user: UserRecord) => {
    if (!selectedMailbox) return

    try {
      await addMember({
        mailboxId: selectedMailbox.id,
        user_uid: getUserId(user),
      }).unwrap()

      toast.success(t('memberAddSuccess', { name: getUserDisplayName(user) }))
      refetchMailboxes()
      // Close and reopen to refresh
      setShowMembersDialog(false)
      setTimeout(() => setShowMembersDialog(true), 100)
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.memberAddFailed'))
    }
  }

  const handleRemoveMember = async (userUid: string) => {
    if (!selectedMailbox) return

    try {
      await removeMember({
        mailboxId: selectedMailbox.id,
        user_uid: userUid,
      }).unwrap()

      toast.success(t('memberRemoveSuccess'))
      // Close and reopen to refresh
      setShowMembersDialog(false)
      setTimeout(() => setShowMembersDialog(true), 100)
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.memberRemoveFailed'))
    }
  }

  const openEditDialog = (mailbox: SharedMailbox) => {
    setSelectedMailbox(mailbox)
    setFormEmail(mailbox.email)
    setFormName(mailbox.name)
    setFormDescription(mailbox.description || '')
    setFormIsActive(mailbox.is_active)
    setShowEditDialog(true)
  }

  const openDeleteDialog = (mailbox: SharedMailbox) => {
    setSelectedMailbox(mailbox)
    setShowDeleteDialog(true)
  }

  const openMembersDialog = (mailbox: SharedMailbox) => {
    setSelectedMailbox(mailbox)
    setMemberSearch('')
    setShowMembersDialog(true)
  }

  const resetForm = () => {
    setFormEmail('')
    setFormName('')
    setFormDescription('')
    setFormIsActive(true)
    setSelectedUsersToAdd([])
    setMemberSearch('')
  }

  // Render functions
  if (mailboxesLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => {
          setShowCreateDialog(true)
          resetForm()
        }}>
          <Plus className="mr-2 h-4 w-4" /> {t('createMailbox')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 max-w-md"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('members')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('createdAt')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMailboxes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">{t('noMailboxes')}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMailboxes.map((mailbox) => (
                <TableRow key={mailbox.id}>
                  <TableCell className="font-medium">{mailbox.name}</TableCell>
                  <TableCell className="font-mono">{mailbox.email}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => openMembersDialog(mailbox)}
                      className="flex items-center text-sm hover:underline"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {mailbox.member_uids?.length || 0}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={mailbox.is_active ? 'default' : 'secondary'}>
                      {mailbox.is_active ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(mailbox.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(mailbox)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMembersDialog(mailbox)}>
                          <Users className="mr-2 h-4 w-4" />
                          {t('manageMembers')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(mailbox)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogHeader>
          <DialogTitle>{t('createMailbox')}</DialogTitle>
          <DialogDescription>{t('createDescription')}</DialogDescription>
        </DialogHeader>
        <DialogContent className="sm:max-w-[500px]">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="support@example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Support Team"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('description')}
              </Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="col-span-3 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                {t('initialMembers')}
              </Label>
              <div className="col-span-3">
                {usersLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={getUserId(user)}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`user-${getUserId(user)}`}
                          checked={selectedUsersToAdd.some(
                            (u) => getUserId(u) === getUserId(user)
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsersToAdd([...selectedUsersToAdd, user])
                            } else {
                              setSelectedUsersToAdd(
                                selectedUsersToAdd.filter(
                                  (u) => getUserId(u) !== getUserId(user)
                                )
                              )
                            }
                          }}
                        />
                        <Label
                          htmlFor={`user-${getUserId(user)}`}
                          className="text-sm font-normal"
                        >
                          {getUserDisplayName(user)} ({getUserEmail(user)})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                resetForm()
              }}
              disabled={isCreating}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !formEmail || !formName}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                t('create')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogHeader>
          <DialogTitle>{t('editMailbox')}</DialogTitle>
          <DialogDescription>
            {t('editDescription', { name: selectedMailbox?.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="sm:max-w-[500px]">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                {t('email')}
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                disabled
                className="col-span-3 bg-muted"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Support Team"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                {t('description')}
              </Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="col-span-3 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                {t('status')}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label htmlFor="edit-active" className="text-sm font-normal">
                  {formIsActive ? t('active') : t('inactive')}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false)
                resetForm()
                setSelectedMailbox(null)
              }}
              disabled={isUpdating}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !formName}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('updating')}
                </>
              ) : (
                t('update')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteMailbox')}</DialogTitle>
            <DialogDescription>
              {t('deleteConfirm', { name: selectedMailbox?.name })}
              <span className="text-destructive block mt-2">
                {t('deleteWarning')}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setSelectedMailbox(null)
              }}
              disabled={isDeleting}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                t('delete')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogHeader>
          <DialogTitle>{t('manageMembers')}</DialogTitle>
          <DialogDescription>
            {t('membersDescription', { name: selectedMailbox?.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="sm:max-w-[600px]">
          <div className="grid gap-4 py-4">
            {/* Current Members */}
            <div>
              <h3 className="text-sm font-medium mb-2">{t('currentMembers')}</h3>
              {currentMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noMembers')}</p>
              ) : (
                <div className="space-y-2">
                  {currentMembers.map((memberUid) => {
                    const user = users.find((u) => getUserId(u) === memberUid)
                    return (
                      <div
                        key={memberUid}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span>
                          {user ? getUserDisplayName(user) : memberUid}
                          {user?.mail && ` (${getUserEmail(user)})`}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(memberUid)}
                          disabled={isDeleting}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Add Members */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">{t('addMembers')}</h3>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchUsers')}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={getUserId(user)}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                  >
                    <span>
                      {getUserDisplayName(user)} ({getUserEmail(user)})
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddMember(user)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMembersDialog(false)
                setSelectedMailbox(null)
                setMemberSearch('')
              }}
            >
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
