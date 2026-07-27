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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useGetResourcesQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import type { Resource } from '@/features/admin-panel/store/resource-booking-api'
import { useTranslations } from 'next-intl'
import { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Edit, RefreshCw, Building2, Monitor, Car, Package } from 'lucide-react'

function ResourceTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'room':
      return <Building2 className="h-4 w-4" />
    case 'equipment':
      return <Monitor className="h-4 w-4" />
    case 'vehicle':
      return <Car className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

interface ResourceFormData {
  name: string
  email: string
  resource_type: string
  description: string
  capacity: string
  location: string
  booking_policy: string
  auto_accept: boolean
}

const emptyForm: ResourceFormData = {
  name: '',
  email: '',
  resource_type: 'room',
  description: '',
  capacity: '',
  location: '',
  booking_policy: 'open',
  auto_accept: true,
}

export default function ResourcesPage(): ReactNode {
  const t = useTranslations('AP_RESOURCES')

  const {
    data: resources = [],
    isLoading,
    isError,
    refetch,
  } = useGetResourcesQuery()

  const [createResource] = useCreateResourceMutation()
  const [updateResource] = useUpdateResourceMutation()
  const [deleteResource] = useDeleteResourceMutation()

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<ResourceFormData>(emptyForm)

  const updateField = (field: keyof ResourceFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = useCallback(async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(t('errors.name_email_required.string'))
      return
    }
    try {
      await createResource({
        name: form.name.trim(),
        email: form.email.trim(),
        resource_type: form.resource_type,
        description: form.description.trim(),
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        location: form.location.trim() || undefined,
        booking_policy: form.booking_policy,
        auto_accept: form.auto_accept,
      }).unwrap()
      toast.success(t('create.success.string'))
      setCreateDialogOpen(false)
      setForm(emptyForm)
      refetch()
    } catch {
      toast.error(t('errors.create_failed.string'))
    }
  }, [form, createResource, t, refetch])

  const handleEdit = useCallback(async () => {
    if (!editingResource) return
    try {
      await updateResource({
        id: editingResource.id,
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          resource_type: form.resource_type,
          description: form.description.trim(),
          capacity: form.capacity ? parseInt(form.capacity, 10) : null,
          location: form.location.trim() || null,
          booking_policy: form.booking_policy,
          auto_accept: form.auto_accept,
        },
      }).unwrap()
      toast.success(t('edit.success.string'))
      setEditDialogOpen(false)
      setEditingResource(null)
      setForm(emptyForm)
      refetch()
    } catch {
      toast.error(t('errors.update_failed.string'))
    }
  }, [editingResource, form, updateResource, t, refetch])

  const handleDelete = useCallback(async () => {
    if (!deletingId) return
    try {
      await deleteResource(deletingId).unwrap()
      toast.success(t('delete.success.string'))
      setDeleteDialogOpen(false)
      setDeletingId(null)
      refetch()
    } catch {
      toast.error(t('errors.delete_failed.string'))
    }
  }, [deletingId, deleteResource, t, refetch])

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource)
    setForm({
      name: resource.name,
      email: resource.email,
      resource_type: resource.resource_type,
      description: resource.description,
      capacity: resource.capacity?.toString() ?? '',
      location: resource.location ?? '',
      booking_policy: resource.booking_policy,
      auto_accept: resource.auto_accept,
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title.string')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('description.string')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refresh.string')}
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setCreateDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-1" />
            {t('create.button.string')}
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="text-destructive p-4 rounded-md border border-destructive/20 bg-destructive/5 mb-4">
          {t('errors.load_failed.string')}
        </div>
      )}

      {/* Resources table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name.string')}</TableHead>
              <TableHead>{t('table.email.string')}</TableHead>
              <TableHead>{t('table.type.string')}</TableHead>
              <TableHead>{t('table.capacity.string')}</TableHead>
              <TableHead>{t('table.location.string')}</TableHead>
              <TableHead>{t('table.policy.string')}</TableHead>
              <TableHead>{t('table.status.string')}</TableHead>
              <TableHead className="w-24">{t('table.actions.string')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {t('table.no_resources.string')}
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource: Resource) => (
                <TableRow key={resource.id} className={!resource.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <ResourceTypeIcon type={resource.resource_type} />
                      {resource.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{resource.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{resource.resource_type}</Badge>
                  </TableCell>
                  <TableCell>{resource.capacity ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {resource.location || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={resource.booking_policy === 'open' ? 'default' : 'secondary'}>
                      {resource.booking_policy}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={resource.is_active ? 'default' : 'outline'} className={
                      resource.is_active ? 'bg-green-600' : ''
                    }>
                      {resource.is_active ? t('status.active.string') : t('status.inactive.string')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(resource)}
                        aria-label={`Edit ${resource.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(resource.id)}
                        aria-label={`Delete ${resource.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        {resources.length} {resources.length === 1 ? t('count_one.string') : t('count_many.string')}
      </div>

      {/* Create dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('create.title.string')}</DialogTitle>
            <DialogDescription>{t('create.description.string')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('labels.name.string')}</Label>
                <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Conference Room A" />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.email.string')}</Label>
                <Input value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="room-a@example.org" />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.type.string')}</Label>
                <Select value={form.resource_type} onValueChange={(v) => updateField('resource_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">🏠 {t('types.room.string')}</SelectItem>
                    <SelectItem value="equipment">🖥️ {t('types.equipment.string')}</SelectItem>
                    <SelectItem value="vehicle">🚗 {t('types.vehicle.string')}</SelectItem>
                    <SelectItem value="other">📦 {t('types.other.string')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('labels.capacity.string')}</Label>
                <Input type="number" min={1} value={form.capacity} onChange={(e) => updateField('capacity', e.target.value)} placeholder="20" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('labels.location.string')}</Label>
                <Input value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Building A, Floor 1" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('labels.description.string')}</Label>
                <Input value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder={t('placeholders.description.string')} />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.booking_policy.string')}</Label>
                <Select value={form.booking_policy} onValueChange={(v) => updateField('booking_policy', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t('policies.open.string')}</SelectItem>
                    <SelectItem value="moderated">{t('policies.moderated.string')}</SelectItem>
                    <SelectItem value="restricted">{t('policies.restricted.string')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.auto_accept}
                    onChange={(e) => updateField('auto_accept', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {t('labels.auto_accept.string')}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('cancel.string')}
            </Button>
            <Button onClick={handleCreate}>{t('create.submit.string')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('edit.title.string')}</DialogTitle>
            <DialogDescription>{t('edit.description.string')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('labels.name.string')}</Label>
                <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.email.string')}</Label>
                <Input value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.type.string')}</Label>
                <Select value={form.resource_type} onValueChange={(v) => updateField('resource_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">🏠 {t('types.room.string')}</SelectItem>
                    <SelectItem value="equipment">🖥️ {t('types.equipment.string')}</SelectItem>
                    <SelectItem value="vehicle">🚗 {t('types.vehicle.string')}</SelectItem>
                    <SelectItem value="other">📦 {t('types.other.string')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('labels.capacity.string')}</Label>
                <Input type="number" min={1} value={form.capacity} onChange={(e) => updateField('capacity', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('labels.location.string')}</Label>
                <Input value={form.location} onChange={(e) => updateField('location', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t('labels.description.string')}</Label>
                <Input value={form.description} onChange={(e) => updateField('description', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.booking_policy.string')}</Label>
                <Select value={form.booking_policy} onValueChange={(v) => updateField('booking_policy', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t('policies.open.string')}</SelectItem>
                    <SelectItem value="moderated">{t('policies.moderated.string')}</SelectItem>
                    <SelectItem value="restricted">{t('policies.restricted.string')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.auto_accept}
                    onChange={(e) => updateField('auto_accept', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {t('labels.auto_accept.string')}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('cancel.string')}
            </Button>
            <Button onClick={handleEdit}>{t('edit.submit.string')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.confirm.string')}</DialogTitle>
            <DialogDescription>{t('delete.description.string')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('cancel.string')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete.submit.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
