'use client'

import { Button } from '@/components/ui/button'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useListSharesQuery,
  useAddShareMutation,
  useRemoveShareMutation,
  useSearchUsersQuery,
} from '@/features/calendars/store/calendars-api'
import type { CalendarShare } from '@/features/calendars/calendars-types'
import { useTranslations } from 'next-intl'
import {
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { toast } from 'sonner'
import { Trash2, Plus, Check, Loader2 } from 'lucide-react'

interface ShareFormProps {
  calendarKey: string
}

const LEVEL_OPTIONS = [
  { value: 'none', label: 'No Access' },
  { value: 'view_date_time', label: 'View Date/Time' },
  { value: 'view_all', label: 'View All Details' },
  { value: 'respond', label: 'Respond' },
  { value: 'modify_if_org', label: 'Modify Own Events' },
  { value: 'modify', label: 'Modify All' },
]

export default function ShareForm({ calendarKey }: ShareFormProps): ReactNode {
  const t = useTranslations('')
  const ts = useTranslations('CALENDARS')

  // Fetch existing shares
  const { data: shares = [], isLoading } = useListSharesQuery(calendarKey)
  const [addShare, { isLoading: isAdding }] = useAddShareMutation()
  const [removeShare, { isLoading: isRemoving }] = useRemoveShareMutation()

  // Add share form state
  const [newUserUid, setNewUserUid] = useState('')
  const [newPublicLevel, setNewPublicLevel] = useState('view_all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserSearch, setShowUserSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // User search
  const { data: searchResults = [], isFetching: isSearching } =
    useSearchUsersQuery(
      { q: searchQuery, limit: 10 },
      { skip: searchQuery.length < 2 || !showUserSearch },
    )

  const handleAddShare = useCallback(async () => {
    if (!newUserUid.trim()) return
    try {
      await addShare({
        key: calendarKey,
        body: {
          user_uid: newUserUid.trim(),
          public_level: newPublicLevel,
        },
      }).unwrap()
      toast.success(ts('share.added.string'))
      setNewUserUid('')
      setShowUserSearch(false)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
          : ''
      toast.error(`${ts('share.addError.string')}${msg ? `: ${msg}` : ''}`)
    }
  }, [addShare, calendarKey, newUserUid, newPublicLevel, ts])

  const handleRemoveShare = useCallback(
    async (userUid: string) => {
      try {
        await removeShare({ key: calendarKey, userUid }).unwrap()
        toast.success(ts('share.removed.string'))
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'data' in err
            ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
            : ''
        toast.error(`${ts('share.removeError.string')}${msg ? `: ${msg}` : ''}`)
      }
    },
    [removeShare, calendarKey, ts],
  )

  // Close user search on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowUserSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{ts('share.title.string')}</h2>
        <p className="text-sm text-muted-foreground">
          {ts('share.description.string')}
        </p>
      </div>

      {/* Add Share Form */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">{ts('share.addUser.string')}</h3>

        {/* User search / input */}
        <div className="relative" ref={searchRef}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={ts('share.searchPlaceholder.string')}
                value={newUserUid}
                onChange={(e) => {
                  setNewUserUid(e.target.value)
                  if (e.target.value.length >= 2) {
                    setSearchQuery(e.target.value)
                    setShowUserSearch(true)
                  } else {
                    setShowUserSearch(false)
                  }
                }}
                onFocus={() => {
                  if (newUserUid.length >= 2) setShowUserSearch(true)
                }}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            <Select value={newPublicLevel} onValueChange={setNewPublicLevel}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              onClick={handleAddShare}
              disabled={isAdding || !newUserUid.trim()}
            >
              <Plus className="mr-1 h-4 w-4" />
              {ts('share.addButton.string')}
            </Button>
          </div>

          {/* Search results dropdown */}
          {showUserSearch && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
              {searchResults.map((user) => (
                <button
                  key={(user as { email?: string }).email ?? (user as { uid?: string }).uid ?? ''}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    const email = (user as { email?: string }).email ?? (user as { uid?: string }).uid ?? (user as { displayName?: string }).displayName ?? ''
                    setNewUserUid(email)
                    setShowUserSearch(false)
                  }}
                >
                  <Check className="h-3 w-3 text-muted-foreground" />
                  <span>{(user as { email?: string }).email ?? (user as { uid?: string }).uid ?? ''}</span>
                  <span className="text-muted-foreground text-xs">
                    {(user as { displayName?: string }).displayName ?? ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Existing Shares Table */}
      <div>
        <h3 className="mb-2 text-sm font-medium">
          {ts('share.existingShares.string')} ({shares.length})
        </h3>
        {shares.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {ts('share.noShares.string')}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ts('share.table.user.string')}</TableHead>
                  <TableHead>{ts('share.table.level.string')}</TableHead>
                  <TableHead>{ts('share.table.canCreate.string')}</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shares.map((share: CalendarShare) => (
                  <TableRow key={share.user_uid}>
                    <TableCell className="font-medium">
                      {share.user_uid}
                    </TableCell>
                    <TableCell>{share.public_level}</TableCell>
                    <TableCell>
                      {share.can_create ? '✓' : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveShare(share.user_uid)}
                        disabled={isRemoving}
                        title={ts('share.removeButton.string')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
