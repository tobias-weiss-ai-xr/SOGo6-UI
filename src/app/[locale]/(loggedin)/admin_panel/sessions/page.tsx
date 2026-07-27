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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  useGetActiveUsersQuery,
  useRevokeSessionsMutation,
  useRevokeInactiveSessionsMutation,
} from '@/features/admin-panel/store/admin-panel-api'
import { useTranslations } from 'next-intl'
import { ReactNode, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { RefreshCw, Trash2, Clock } from 'lucide-react'

type Session = {
  uid: string
  domain: string
  last_activity: string
  session_key: string
}

function formatTimestamp(ts: string): string {
  const date = new Date(Number(ts) * 1000)
  return date.toLocaleString()
}

function getTimeAgo(ts: string): string {
  const now = Date.now()
  const then = Number(ts) * 1000
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function SessionsPage(): ReactNode {
  const t = useTranslations('')
  const ts = useTranslations('AP_SESSIONS')

  const {
    data: sessions = [],
    isLoading,
    isError,
    refetch,
  } = useGetActiveUsersQuery() as {
    data?: Session[]
    isLoading: boolean
    isError: boolean
    refetch: () => void
  }

  const [revokeSessions] = useRevokeSessionsMutation()
  const [revokeInactiveSessions] = useRevokeInactiveSessionsMutation()

  // Revoke single session dialog
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)

  // Revoke inactive dialog
  const [inactiveDialogOpen, setInactiveDialogOpen] = useState(false)
  const [inactiveDays, setInactiveDays] = useState('30')

  // Selection state
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const handleRevokeSingle = useCallback(async () => {
    if (!revokeTarget) return
    try {
      await revokeSessions({ uid: [revokeTarget.uid] }).unwrap()
      toast.success(ts('revoke.success.string'))
      setRevokeDialogOpen(false)
      setRevokeTarget(null)
      refetch()
    } catch {
      toast.error(ts('revoke.error.string'))
    }
  }, [revokeTarget, revokeSessions, ts, refetch])

  const handleRevokeSelected = useCallback(async () => {
    const uids = Array.from(selectedUids)
    if (uids.length === 0) return
    try {
      const result = await revokeSessions({ uid: uids }).unwrap()
      toast.success(
        t('AP_SESSIONS.revoke.success_multiple.string', { count: result.revoked })
      )
      setSelectedUids(new Set())
      setSelectAll(false)
      refetch()
    } catch {
      toast.error(ts('revoke.error.string'))
    }
  }, [selectedUids, revokeSessions, ts, t, refetch])

  const handleRevokeInactive = useCallback(async () => {
    const days = parseInt(inactiveDays, 10)
    if (isNaN(days) || days < 1) {
      toast.error('Please enter a valid number of days')
      return
    }
    const timestamp = Math.floor(Date.now() / 1000) - days * 86400
    try {
      const result = await revokeInactiveSessions({ timestamp }).unwrap()
      toast.success(
        `${result.revoked} inactive session(s) revoked`
      )
      setInactiveDialogOpen(false)
      refetch()
    } catch {
      toast.error('Failed to revoke inactive sessions')
    }
  }, [inactiveDays, revokeInactiveSessions, refetch])

  const toggleSelection = (uid: string) => {
    setSelectedUids((prev) => {
      const next = new Set(prev)
      if (next.has(uid)) {
        next.delete(uid)
      } else {
        next.add(uid)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUids(new Set())
      setSelectAll(false)
    } else {
      setSelectedUids(new Set(sessions.map((s: Session) => s.uid)))
      setSelectAll(true)
    }
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
          <h1 className="text-2xl font-bold">
            {ts('title.string')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {ts('description.string')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {ts('refresh.string')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInactiveDialogOpen(true)}
          >
            <Clock className="h-4 w-4 mr-1" />
            {ts('revoke_inactive.button.string')}
          </Button>
          {selectedUids.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeSelected}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {selectedUids.size === 1
                ? ts('revoke.revoke_selected.string')
                : t('AP_SESSIONS.revoke.revoke_selected_one.string', {
                    count: selectedUids.size,
                  })}
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="text-destructive p-4 rounded-md border border-destructive/20 bg-destructive/5 mb-4">
          Failed to load active sessions. Please try again.
        </div>
      )}

      {/* Sessions table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectAll && sessions.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                  aria-label="Select all sessions"
                />
              </TableHead>
              <TableHead>{ts('table.uid.string')}</TableHead>
              <TableHead>{ts('table.domain.string')}</TableHead>
              <TableHead>{ts('table.last_activity.string')}</TableHead>
              <TableHead className="w-24">{ts('table.actions.string')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {ts('table.no_sessions.string')}
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session: Session) => {
                const isSelected = selectedUids.has(session.uid)
                return (
                  <TableRow
                    key={session.session_key}
                    className={isSelected ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(session.uid)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Select session for ${session.uid}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {session.uid}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{session.domain}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatTimestamp(session.last_activity)}</span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(session.last_activity)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setRevokeTarget(session)
                          setRevokeDialogOpen(true)
                        }}
                        aria-label={`Revoke session for ${session.uid}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
      </div>

      {/* Revoke single session dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts('revoke.confirm.string')}</DialogTitle>
            <DialogDescription>
              {revokeTarget && (
                <span>
                  This will invalidate the session for{' '}
                  <strong>{revokeTarget.uid}</strong>. The user will need to
                  log in again.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeSingle}>
              {ts('revoke.button.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke inactive sessions dialog */}
      <Dialog open={inactiveDialogOpen} onOpenChange={setInactiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ts('revoke_inactive.confirm.string')}</DialogTitle>
            <DialogDescription>
              Revoke all sessions that have been inactive for more than the
              specified number of days.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">
              {ts('revoke_inactive.days.string')}
            </label>
            <Input
              type="number"
              min={1}
              value={inactiveDays}
              onChange={(e) => setInactiveDays(e.target.value)}
              placeholder={ts('revoke_inactive.days_placeholder.string')}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInactiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeInactive}>
              {ts('revoke_inactive.button.string')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
