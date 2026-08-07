'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  useAddSharedMailboxMemberMutation,
  useCreateSharedMailboxAssignmentMutation,
  useCreateSharedMailboxMutation,
  useCreateSharedMailboxNoteMutation,
  useDeleteSharedMailboxAssignmentMutation,
  useDeleteSharedMailboxMutation,
  useDeleteSharedMailboxNoteMutation,
  useGetSharedMailboxAnalyticsQuery,
  useGetSharedMailboxMembersQuery,
  useListSharedMailboxAssignmentsQuery,
  useListSharedMailboxesQuery,
  useListSharedMailboxNotesQuery,
  useListUsersQuery,
  useRemoveSharedMailboxMemberMutation,
  useUpdateSharedMailboxAssignmentMutation,
  useUpdateSharedMailboxMemberRoleMutation,
  useUpdateSharedMailboxMutation,
  type SharedMailbox,
  type SharedMailboxMemberRole,
} from '@/features/admin-panel/store/admin-panel-api'
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  StickyNote,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'
import { toast } from 'sonner'

type UserRecord = {
  uid?: string[]
  cn?: string[]
  mail?: string[]
}

const ROLES = ['admin', 'moderator', 'member'] as const
type Role = (typeof ROLES)[number]

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
    error: mailboxesError,
    refetch: refetchMailboxes,
  } = useListSharedMailboxesQuery()

  const [createSharedMailbox, { isLoading: isCreating }] =
    useCreateSharedMailboxMutation()
  const [updateSharedMailbox, { isLoading: isUpdating }] =
    useUpdateSharedMailboxMutation()
  const [deleteSharedMailbox, { isLoading: isDeleting }] =
    useDeleteSharedMailboxMutation()
  const [addMember] = useAddSharedMailboxMemberMutation()
  const [removeMember] = useRemoveSharedMailboxMemberMutation()
  const [updateMemberRole] = useUpdateSharedMailboxMemberRoleMutation()
  const [createNote, { isLoading: isAddingNote }] =
    useCreateSharedMailboxNoteMutation()
  const [deleteNote] = useDeleteSharedMailboxNoteMutation()
  const [createAssignment, { isLoading: isCreatingAssignment }] =
    useCreateSharedMailboxAssignmentMutation()
  const [updateAssignment] = useUpdateSharedMailboxAssignmentMutation()
  const [deleteAssignment] = useDeleteSharedMailboxAssignmentMutation()

  // User Queries (for member selection)
  const { data: usersData } = useListUsersQuery()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedMailbox, setSelectedMailbox] = useState<SharedMailbox | null>(
    null
  )
  const [activeTab, setActiveTab] = useState('analytics')

  // Form State for Create/Edit
  const [formEmail, setFormEmail] = useState('')
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setIsActive] = useState(true)
  // Quota
  const [formQuotaEnabled, setFormQuotaEnabled] = useState(false)
  const [formQuotaMaxSize, setFormQuotaMaxSize] = useState('')
  const [formQuotaMaxEmails, setFormQuotaMaxEmails] = useState('')
  // Auto-responder
  const [formAutoRespondEnabled, setFormAutoRespondEnabled] = useState(false)
  const [formAutoRespondSubject, setFormAutoRespondSubject] = useState('')
  const [formAutoRespondMessage, setFormAutoRespondMessage] = useState('')
  // Forwarding
  const [formForwardTo, setFormForwardTo] = useState('')
  const [formForwardKeepCopy, setFormForwardKeepCopy] = useState(true)
  // Signatures
  const [formSignatureEnabled, setFormSignatureEnabled] = useState(false)
  const [formSignatureHtml, setFormSignatureHtml] = useState('')
  const [formSignaturePlain, setFormSignaturePlain] = useState('')

  // Member management state
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<UserRecord[]>([])
  const [addRole, setAddRole] = useState<Role>('member')

  // Notes state
  const [noteContent, setNoteContent] = useState('')
  const [notePrivate, setNotePrivate] = useState(false)

  // Assignment state
  const [assignmentEmail, setAssignmentEmail] = useState('')
  const [assignmentTo, setAssignmentTo] = useState('')
  const [assignmentReason, setAssignmentReason] = useState('')

  // Extract data
  const mailboxes: SharedMailbox[] = mailboxesData?.mailboxes ?? []
  const users: UserRecord[] = ((usersData as unknown as { data?: UserRecord[] })
    ?.data ?? []) as UserRecord[]

  // Get members for selected mailbox
  const { data: selectedMailboxMembers } = useGetSharedMailboxMembersQuery(
    selectedMailbox?.id ?? '',
    { skip: !selectedMailbox?.id || !(showMembersDialog || showDetailsDialog) }
  )
  const currentMembers: string[] = selectedMailboxMembers?.members ?? []
  const memberRoles: SharedMailboxMemberRole[] =
    selectedMailboxMembers?.member_roles ?? []

  const getMemberRole = (uid: string): Role => {
    const found = memberRoles.find((r) => r.uid === uid)
    if (found && ROLES.includes(found.role as Role)) return found.role as Role
    return 'member'
  }

  // Analytics for selected mailbox (details dialog)
  const { data: analytics } = useGetSharedMailboxAnalyticsQuery(
    selectedMailbox?.id ?? '',
    { skip: !selectedMailbox?.id || !showDetailsDialog }
  )

  // Notes for selected mailbox (details dialog)
  const { data: notesData, refetch: refetchNotes } =
    useListSharedMailboxNotesQuery(selectedMailbox?.id ?? '', {
      skip: !selectedMailbox?.id || !showDetailsDialog,
    })
  const notes = notesData?.notes ?? []

  // Assignments for selected mailbox (details dialog)
  const { data: assignmentsData, refetch: refetchAssignments } =
    useListSharedMailboxAssignmentsQuery(selectedMailbox?.id ?? '', {
      skip: !selectedMailbox?.id || !showDetailsDialog,
    })
  const assignments = assignmentsData?.assignments ?? []

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
      getUserDisplayName(u)
        .toLowerCase()
        .includes(memberSearch.toLowerCase()) ||
      getUserEmail(u).toLowerCase().includes(memberSearch.toLowerCase())
  )
  const availableUsers = filteredUsers.filter(
    (u) => !currentMembers.includes(getUserId(u))
  )

  // ── Handlers ────────────────────────────────────────────────────────────

  const buildExtendedPayload = () => ({
    quota_enabled: formQuotaEnabled,
    quota_max_size: formQuotaMaxSize ? Number(formQuotaMaxSize) : undefined,
    quota_max_emails: formQuotaMaxEmails
      ? Number(formQuotaMaxEmails)
      : undefined,
    auto_respond_enabled: formAutoRespondEnabled,
    auto_respond_subject: formAutoRespondSubject || undefined,
    auto_respond_message: formAutoRespondMessage || undefined,
    forward_to: formForwardTo
      ? formForwardTo
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    forward_keep_copy: formForwardKeepCopy,
    signature_enabled: formSignatureEnabled,
    signature_html: formSignatureHtml || undefined,
    signature_plain: formSignaturePlain || undefined,
  })

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
        ...buildExtendedPayload(),
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
        ...buildExtendedPayload(),
      }).unwrap()
      toast.success(t('editSuccess'))
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
        role: addRole,
      }).unwrap()
      toast.success(t('memberAddSuccess', { name: getUserDisplayName(user) }))
      refetchMailboxes()
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
      refetchMailboxes()
      setShowMembersDialog(false)
      setTimeout(() => setShowMembersDialog(true), 100)
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.memberRemoveFailed'))
    }
  }

  const handleUpdateRole = async (userUid: string, role: Role) => {
    if (!selectedMailbox) return
    try {
      await updateMemberRole({
        mailboxId: selectedMailbox.id,
        user_uid: userUid,
        role,
      }).unwrap()
      toast.success(t('roleUpdateSuccess'))
      refetchMailboxes()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('roleUpdateFailed'))
    }
  }

  const handleAddNote = async () => {
    if (!selectedMailbox || !noteContent.trim()) {
      toast.error(t('error.requiredFields'))
      return
    }
    try {
      await createNote({
        mailboxId: selectedMailbox.id,
        content: noteContent,
        is_private: notePrivate,
      }).unwrap()
      toast.success(t('noteAdded'))
      setNoteContent('')
      setNotePrivate(false)
      refetchNotes()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.noteAddFailed'))
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedMailbox) return
    try {
      await deleteNote({ mailboxId: selectedMailbox.id, noteId }).unwrap()
      toast.success(t('noteDeleteSuccess'))
      refetchNotes()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('noteDeleteFailed'))
    }
  }

  const handleCreateAssignment = async () => {
    if (!selectedMailbox || !assignmentEmail || !assignmentTo) {
      toast.error(t('error.requiredFields'))
      return
    }
    try {
      await createAssignment({
        mailboxId: selectedMailbox.id,
        email_id: assignmentEmail,
        assigned_to: assignmentTo,
        reason: assignmentReason || undefined,
      }).unwrap()
      toast.success(t('assignmentAdded'))
      setAssignmentEmail('')
      setAssignmentTo('')
      setAssignmentReason('')
      refetchAssignments()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('error.assignmentCreateFailed'))
    }
  }

  const handleUpdateAssignment = async (
    assignmentId: string,
    status: string
  ) => {
    if (!selectedMailbox) return
    try {
      await updateAssignment({
        mailboxId: selectedMailbox.id,
        assignmentId,
        status,
      }).unwrap()
      toast.success(t('assignmentUpdateSuccess'))
      refetchAssignments()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('assignmentUpdateFailed'))
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!selectedMailbox) return
    try {
      await deleteAssignment({
        mailboxId: selectedMailbox.id,
        assignmentId,
      }).unwrap()
      toast.success(t('assignmentDeleteSuccess'))
      refetchAssignments()
    } catch (error: any) {
      toast.error(error.data?.error_msg || t('assignmentDeleteFailed'))
    }
  }

  const openEditDialog = (mailbox: SharedMailbox) => {
    setSelectedMailbox(mailbox)
    setFormEmail(mailbox.email)
    setFormName(mailbox.name)
    setFormDescription(mailbox.description || '')
    setIsActive(mailbox.is_active)
    setFormQuotaEnabled(mailbox.quota_enabled ?? false)
    setFormQuotaMaxSize(
      mailbox.quota_max_size != null ? String(mailbox.quota_max_size) : ''
    )
    setFormQuotaMaxEmails(
      mailbox.quota_max_emails != null ? String(mailbox.quota_max_emails) : ''
    )
    setFormAutoRespondEnabled(mailbox.auto_respond_enabled ?? false)
    setFormAutoRespondSubject(mailbox.auto_respond_subject ?? '')
    setFormAutoRespondMessage(mailbox.auto_respond_message ?? '')
    setFormForwardTo(mailbox.forward_to?.join(', ') ?? '')
    setFormForwardKeepCopy(mailbox.forward_keep_copy ?? true)
    setFormSignatureEnabled(mailbox.signature_enabled ?? false)
    setFormSignatureHtml(mailbox.signature_html ?? '')
    setFormSignaturePlain(mailbox.signature_plain ?? '')
    setShowEditDialog(true)
  }

  const openDeleteDialog = (mailbox: SharedMailbox) => {
    setSelectedMailbox(mailbox)
    setShowDeleteDialog(true)
  }

  const openMembersDialog = (mailbox: SharedMailbox) => {
    setSelectedMailbox(mailbox)
    setMemberSearch('')
    setAddRole('member')
    setShowMembersDialog(true)
  }

  const openDetailsDialog = (mailbox: SharedMailbox) => {
    setSelectedMailbox(mailbox)
    setActiveTab('analytics')
    setShowDetailsDialog(true)
  }

  const resetForm = () => {
    setFormEmail('')
    setFormName('')
    setFormDescription('')
    setIsActive(true)
    setFormQuotaEnabled(false)
    setFormQuotaMaxSize('')
    setFormQuotaMaxEmails('')
    setFormAutoRespondEnabled(false)
    setFormAutoRespondSubject('')
    setFormAutoRespondMessage('')
    setFormForwardTo('')
    setFormForwardKeepCopy(true)
    setFormSignatureEnabled(false)
    setFormSignatureHtml('')
    setFormSignaturePlain('')
    setSelectedUsersToAdd([])
    setMemberSearch('')
  }

  const roleLabel = (role: string): string => {
    if (role === 'admin') return t('roleAdmin')
    if (role === 'moderator') return t('roleModerator')
    return t('roleMember')
  }

  const statusLabel = (status: string): string => {
    if (status === 'pending') return t('statusPending')
    if (status === 'accepted') return t('statusAccepted')
    if (status === 'completed') return t('statusCompleted')
    if (status === 'cancelled') return t('statusCancelled')
    return status
  }

  // Render functions
  if (mailboxesLoading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // ── Form Sections (shared between create/edit) ──────────────────────────

  const formSections = (
    <>
      {/* Quota */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{t('quota')}</h3>
          <Switch
            checked={formQuotaEnabled}
            onCheckedChange={setFormQuotaEnabled}
            aria-label={t('quotaEnabled')}
          />
        </div>
        {formQuotaEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quota-max-size">{t('quotaMaxSize')}</Label>
              <Input
                id="quota-max-size"
                type="number"
                min={1}
                value={formQuotaMaxSize}
                onChange={(e) => setFormQuotaMaxSize(e.target.value)}
                placeholder="1024"
              />
            </div>
            <div>
              <Label htmlFor="quota-max-emails">{t('quotaMaxEmails')}</Label>
              <Input
                id="quota-max-emails"
                type="number"
                min={1}
                value={formQuotaMaxEmails}
                onChange={(e) => setFormQuotaMaxEmails(e.target.value)}
                placeholder="10000"
              />
            </div>
          </div>
        )}
      </div>

      {/* Auto-responder */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{t('autoRespond')}</h3>
          <Switch
            checked={formAutoRespondEnabled}
            onCheckedChange={setFormAutoRespondEnabled}
            aria-label={t('autoRespondEnabled')}
          />
        </div>
        {formAutoRespondEnabled && (
          <>
            <div>
              <Label htmlFor="auto-respond-subject">
                {t('autoRespondSubject')}
              </Label>
              <Input
                id="auto-respond-subject"
                value={formAutoRespondSubject}
                onChange={(e) => setFormAutoRespondSubject(e.target.value)}
                placeholder="We received your email"
              />
            </div>
            <div>
              <Label htmlFor="auto-respond-message">
                {t('autoRespondMessage')}
              </Label>
              <Textarea
                id="auto-respond-message"
                value={formAutoRespondMessage}
                onChange={(e) => setFormAutoRespondMessage(e.target.value)}
                placeholder="Thank you for your message..."
                className="min-h-[80px]"
              />
            </div>
          </>
        )}
      </div>

      {/* Forwarding */}
      <div className="space-y-3 rounded-lg border p-4">
        <h3 className="text-sm font-medium">{t('forwarding')}</h3>
        <div>
          <Label htmlFor="forward-to">{t('forwardTo')}</Label>
          <Input
            id="forward-to"
            value={formForwardTo}
            onChange={(e) => setFormForwardTo(e.target.value)}
            placeholder="team@example.org, manager@example.org"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="forward-keep-copy"
            checked={formForwardKeepCopy}
            onCheckedChange={(checked) =>
              setFormForwardKeepCopy(checked === true)
            }
          />
          <Label htmlFor="forward-keep-copy" className="text-sm font-normal">
            {t('forwardKeepCopy')}
          </Label>
        </div>
      </div>

      {/* Signatures */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{t('signature')}</h3>
          <Switch
            checked={formSignatureEnabled}
            onCheckedChange={setFormSignatureEnabled}
            aria-label={t('signatureEnabled')}
          />
        </div>
        {formSignatureEnabled && (
          <>
            <div>
              <Label htmlFor="signature-html">{t('signatureHtml')}</Label>
              <Textarea
                id="signature-html"
                value={formSignatureHtml}
                onChange={(e) => setFormSignatureHtml(e.target.value)}
                placeholder="<p>Best regards,<br/>Support Team</p>"
                className="min-h-[80px] font-mono text-xs"
              />
            </div>
            <div>
              <Label htmlFor="signature-plain">{t('signaturePlain')}</Label>
              <Textarea
                id="signature-plain"
                value={formSignaturePlain}
                onChange={(e) => setFormSignaturePlain(e.target.value)}
                placeholder="Best regards,\nSupport Team"
                className="min-h-[80px] font-mono text-xs"
              />
            </div>
          </>
        )}
      </div>
    </>
  )

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateDialog(true)
            resetForm()
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> {t('createMailbox')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md pl-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
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
                <TableCell colSpan={6} className="py-8 text-center">
                  <Mail className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                  <p className="text-muted-foreground">{t('noMailboxes')}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredMailboxes.map((mailbox) => (
                <TableRow key={mailbox.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {mailbox.name}
                      {mailbox.quota_enabled && (
                        <Badge variant="outline" className="text-xs">
                          ⛨ {t('quota')}
                        </Badge>
                      )}
                      {mailbox.auto_respond_enabled && (
                        <Badge variant="outline" className="text-xs">
                          ↩ {t('autoRespond')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{mailbox.email}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => openMembersDialog(mailbox)}
                      className="flex items-center text-sm hover:underline"
                    >
                      <Users className="mr-1 h-4 w-4" />
                      {mailbox.member_uids?.length || 0}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={mailbox.is_active ? 'default' : 'secondary'}
                    >
                      {mailbox.is_active ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {mailbox.created_at
                      ? new Date(mailbox.created_at).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openDetailsDialog(mailbox)}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(mailbox)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openMembersDialog(mailbox)}
                        >
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
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('createMailbox')}</DialogTitle>
            <DialogDescription>{t('createDescription')}</DialogDescription>
          </DialogHeader>
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
              <Label className="text-right">{t('initialMembers')}</Label>
              <div className="col-span-3 max-h-[150px] space-y-2 overflow-y-auto">
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
                        if (checked === true) {
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
            </div>
            {formSections}
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
            <Button
              onClick={handleCreate}
              disabled={isCreating || !formEmail || !formName}
            >
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
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('editMailbox')}</DialogTitle>
            <DialogDescription>
              {t('editDescription', { name: selectedMailbox?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
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
                className="bg-muted col-span-3"
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
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <Label htmlFor="edit-active" className="text-sm font-normal">
                  {formIsActive ? t('active') : t('inactive')}
                </Label>
              </div>
            </div>
            {formSections}
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
              {t('deleteConfirm', { name: selectedMailbox?.name ?? '' })}
              <span className="text-destructive mt-2 block">
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
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{t('manageMembers')}</DialogTitle>
            <DialogDescription>
              {t('membersDescription', { name: selectedMailbox?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Current Members */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t('currentMembers')}
              </h3>
              {currentMembers.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t('noMembers')}
                </p>
              ) : (
                <div className="space-y-2">
                  {currentMembers.map((memberUid) => {
                    const user = users.find((u) => getUserId(u) === memberUid)
                    const role = getMemberRole(memberUid)
                    return (
                      <div
                        key={memberUid}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {user ? getUserDisplayName(user) : memberUid}
                            {user?.mail && ` (${getUserEmail(user)})`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {roleLabel(role)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={role}
                            onValueChange={(v) =>
                              handleUpdateRole(memberUid, v as Role)
                            }
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue placeholder={t('role')} />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {roleLabel(r)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(memberUid)}
                            disabled={isDeleting}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Add Members */}
            <div className="border-t pt-4">
              <h3 className="mb-2 text-sm font-medium">{t('addMembers')}</h3>
              <div className="relative mb-2">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  placeholder={t('searchUsers')}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="max-h-[200px] space-y-2 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={getUserId(user)}
                    className="hover:bg-muted/50 flex items-center justify-between rounded border p-2"
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
                {availableUsers.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <Label className="text-sm">{t('role')}</Label>
                    <Select
                      value={addRole}
                      onValueChange={(v) => setAddRole(v as Role)}
                    >
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {roleLabel(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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

      {/* Details Dialog (Analytics / Notes / Assignments) */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedMailbox?.name}</DialogTitle>
            <DialogDescription>
              {t('detailsDescription', { name: selectedMailbox?.email ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analytics">
                <BarChart3 className="mr-1 h-4 w-4" />
                {t('tabAnalytics')}
              </TabsTrigger>
              <TabsTrigger value="notes">
                <StickyNote className="mr-1 h-4 w-4" />
                {t('tabNotes')}
              </TabsTrigger>
              <TabsTrigger value="assignments">
                <ClipboardList className="mr-1 h-4 w-4" />
                {t('tabAssignments')}
              </TabsTrigger>
            </TabsList>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-4">
              {!analytics ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsNotes')}
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics.notes?.total ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsPublicNotes')}:{' '}
                        {analytics.notes?.public ?? 0} ·{' '}
                        {t('analyticsPrivateNotes')}:{' '}
                        {analytics.notes?.private ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsAssignments')}
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics.assignments?.total ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsPending')}:{' '}
                        {analytics.assignments?.pending ?? 0} ·{' '}
                        {t('analyticsAccepted')}:{' '}
                        {analytics.assignments?.accepted ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsCompleted')}
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics.assignments?.completed ?? 0}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsCancelled')}:{' '}
                        {analytics.assignments?.cancelled ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsCompletionRate')}
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics.assignments?.completion_rate ?? 0}%
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t('analyticsLast7d')}:{' '}
                        {analytics.assignments?.last_7_days ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs">
                        {t('notes')} · {t('analyticsLast7d')} /{' '}
                        {t('analyticsLast30d')}
                      </p>
                      <p className="text-xl font-semibold">
                        {analytics.notes?.last_7_days ?? 0} /{' '}
                        {analytics.notes?.last_30_days ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground text-xs">
                        {t('assignments')} · {t('analyticsLast7d')} /{' '}
                        {t('analyticsLast30d')}
                      </p>
                      <p className="text-xl font-semibold">
                        {analytics.assignments?.last_7_days ?? 0} /{' '}
                        {analytics.assignments?.last_30_days ?? 0}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-2 rounded-lg border p-3">
                <Label htmlFor="note-content">{t('noteContent')}</Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={t('notePlaceholder')}
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="note-private"
                      checked={notePrivate}
                      onCheckedChange={(checked) =>
                        setNotePrivate(checked === true)
                      }
                    />
                    <Label
                      htmlFor="note-private"
                      className="text-sm font-normal"
                    >
                      {t('notePrivate')}
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={isAddingNote || !noteContent.trim()}
                  >
                    {isAddingNote ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-1 h-4 w-4" />
                    )}
                    {t('addNote')}
                  </Button>
                </div>
              </div>
              {notes.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {t('noNotes')}
                </p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {note.author_uid}
                          </span>
                          {note.is_private && (
                            <Badge variant="outline" className="text-xs">
                              {t('analyticsPrivateNotes')}
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-xs">
                            {note.created_at
                              ? new Date(note.created_at).toLocaleString()
                              : '—'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="text-destructive h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Assignments */}
            <TabsContent value="assignments" className="space-y-4">
              <div className="space-y-2 rounded-lg border p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="assign-email" className="text-xs">
                      {t('assignmentEmail')}
                    </Label>
                    <Input
                      id="assign-email"
                      value={assignmentEmail}
                      onChange={(e) => setAssignmentEmail(e.target.value)}
                      placeholder={t('assignmentEmailPlaceholder')}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t('assignedTo')}</Label>
                    <Select
                      value={assignmentTo}
                      onValueChange={setAssignmentTo}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('searchUsers')} />
                      </SelectTrigger>
                      <SelectContent>
                        {currentMembers.map((uid) => (
                          <SelectItem key={uid} value={uid}>
                            {uid}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assign-reason" className="text-xs">
                      {t('assignmentReason')}
                    </Label>
                    <Input
                      id="assign-reason"
                      value={assignmentReason}
                      onChange={(e) => setAssignmentReason(e.target.value)}
                      placeholder={t('assignmentReasonPlaceholder')}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleCreateAssignment}
                    disabled={
                      isCreatingAssignment || !assignmentEmail || !assignmentTo
                    }
                  >
                    {isCreatingAssignment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-1 h-4 w-4" />
                    )}
                    {t('addAssignment')}
                  </Button>
                </div>
              </div>
              {assignments.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {t('noAssignments')}
                </p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-lg border p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              assignment.status === 'completed'
                                ? 'default'
                                : assignment.status === 'cancelled'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="text-xs"
                          >
                            {statusLabel(assignment.status)}
                          </Badge>
                          <span className="text-sm font-medium">
                            {assignment.email_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {assignment.status !== 'completed' &&
                            assignment.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleUpdateAssignment(
                                    assignment.id,
                                    'completed'
                                  )
                                }
                                title={t('analyticsCompleted')}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                              </Button>
                            )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                          >
                            <Trash2 className="text-destructive h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {t('assignedTo')}: {assignment.assigned_to} ·{' '}
                        {t('assignedBy')}: {assignment.assigned_by}
                      </p>
                      {assignment.reason && (
                        <p className="mt-1 text-sm">{assignment.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsDialog(false)
                setSelectedMailbox(null)
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
