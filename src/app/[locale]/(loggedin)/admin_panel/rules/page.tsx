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
import { Textarea } from '@/components/ui/textarea'
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
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import { Rule } from '@/features/admin-panel/types/admin-panel'
import { useTranslations } from 'next-intl'
import { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'

export default function RulesPage(): ReactNode {
  const t = useTranslations('')
  const ts = useTranslations('AP_RULES')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // List rules
  const { data: rules = [], isLoading, error } = useGetRulesQuery()

  // Mutations
  const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()
  const [updateRule, { isLoading: isUpdating }] = useUpdateRuleMutation()
  const [deleteRule, { isLoading: isDeleting }] = useDeleteRuleMutation()

  // Dialog state
  const [showCreate, setShowCreate] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [deletingRule, setDeletingRule] = useState<Rule | null>(null)

  // Create form state
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createDomains, setCreateDomains] = useState('')

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDomains, setEditDomains] = useState('')

  // Filter rules by search
  const filteredRules = searchQuery
    ? rules.filter((rule) =>
        rule.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rules

  // Reset create form
  const resetCreateForm = useCallback(() => {
    setCreateName('')
    setCreateDescription('')
    setCreateDomains('')
  }, [])

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!createName.trim()) {
      toast.error(ts('create.name_required.string'))
      return
    }
    try {
      const domains = createDomains
        ? createDomains.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      await createRule({
        rule_name: createName.trim(),
        rule_description: createDescription.trim(),
        rule_domains: domains.length > 0 ? domains : undefined,
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
  }, [createRule, createName, createDescription, createDomains, ts, resetCreateForm])

  // Handle edit dialog open
  const openEdit = useCallback((rule: Rule) => {
    setEditingRule(rule)
    setEditName(rule.name ?? '')
    setEditDescription('')
    setEditDomains('')
  }, [])

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!editingRule) return
    try {
      const domains = editDomains
        ? editDomains.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined
      await updateRule({
        ruleId: editingRule.id,
        body: {
          rule_name: editName.trim() || undefined,
          rule_description: editDescription.trim() || undefined,
          rule_domains: domains,
        },
      }).unwrap()
      toast.success(ts('edit.success.string'))
      setEditingRule(null)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
          : ''
      toast.error(`${ts('edit.error.string')}${msg ? `: ${msg}` : ''}`)
    }
  }, [editingRule, updateRule, editName, editDescription, editDomains, ts])

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!deletingRule) return
    try {
      await deleteRule(deletingRule.id).unwrap()
      toast.success(ts('delete.success.string'))
      setDeletingRule(null)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
          : ''
      toast.error(`${ts('delete.error.string')}${msg ? `: ${msg}` : ''}`)
    }
  }, [deletingRule, deleteRule, ts])

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

      {/* Rules Table */}
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
      ) : filteredRules.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          {searchQuery ? ts('no_results.string') : ts('no_rules.string')}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ts('table.id.string')}</TableHead>
                <TableHead>{ts('table.name.string')}</TableHead>
                <TableHead className="w-[120px]">{ts('table.actions.string')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">{rule.id}</TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(rule)}
                        title={ts('edit.button.string')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingRule(rule)}
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
              {ts('create.description.string')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{ts('form.name.string')} *</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={ts('form.name_placeholder.string')}
              />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.description.string')}</Label>
              <Textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder={ts('form.description_placeholder.string')}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.domains.string')}</Label>
              <Input
                value={createDomains}
                onChange={(e) => setCreateDomains(e.target.value)}
                placeholder={ts('form.domains_placeholder.string')}
              />
              <p className="text-xs text-muted-foreground">{ts('form.domains_hint.string')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetCreateForm() }}>
              {t('AP_SESSIONS.cancel.string') || 'Cancel'}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !createName.trim()}>
              {ts('create.button.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRule} onOpenChange={(open) => { if (!open) setEditingRule(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ts('edit.title.string')}</DialogTitle>
            <DialogDescription>
              {ts('edit.description.string', { name: editingRule?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{ts('form.name.string')}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.description.string')}</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>{ts('form.domains.string')}</Label>
              <Input
                value={editDomains}
                onChange={(e) => setEditDomains(e.target.value)}
                placeholder={ts('form.domains_placeholder.string')}
              />
              <p className="text-xs text-muted-foreground">{ts('form.domains_hint.string')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRule(null)}>
              {t('AP_SESSIONS.cancel.string') || 'Cancel'}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {ts('edit.save.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingRule} onOpenChange={(open) => { if (!open) setDeletingRule(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{ts('delete.title.string')}</DialogTitle>
            <DialogDescription>
              {ts('delete.confirm.string', { name: deletingRule?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRule(null)}>
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
