'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  useListAddressBookSharesQuery,
  useAddAddressBookShareMutation,
  useRemoveAddressBookShareMutation,
} from '@/features/address_books/store/address-books-api'
import type { ApiAddressBookShare } from '@/features/address_books/address-books-api-types'
import { useTranslations } from 'next-intl'
import {
  ReactNode,
  useState,
  useCallback,
} from 'react'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'

interface ShareFormProps {
  addressBookKey: string
}

const LEVEL_OPTIONS = [
  { value: 'view', label: 'View' },
  { value: 'modify', label: 'Modify' },
]

export default function ShareForm({ addressBookKey }: ShareFormProps): ReactNode {
  const ts = useTranslations('ADDRESS_BOOKS_SIDEBAR.sharing')

  // Fetch existing shares
  const { data: sharesData, isLoading } = useListAddressBookSharesQuery(addressBookKey)
  const shares: ApiAddressBookShare[] = sharesData?.shares ?? []
  const [addShare, { isLoading: isAdding }] = useAddAddressBookShareMutation()
  const [removeShare, { isLoading: isRemoving }] = useRemoveAddressBookShareMutation()

  // Add share form state
  const [newUserUid, setNewUserUid] = useState('')
  const [newShareLevel, setNewShareLevel] = useState('view')

  const handleAddShare = useCallback(async () => {
    if (!newUserUid.trim()) return
    try {
      await addShare({
        key: addressBookKey,
        body: {
          user_uid: newUserUid.trim(),
          share_level: newShareLevel,
        },
      }).unwrap()
      toast.success(ts('added.string'))
      setNewUserUid('')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
          : ''
      toast.error(`${ts('addError.string')}${msg ? `: ${msg}` : ''}`)
    }
  }, [addShare, addressBookKey, newUserUid, newShareLevel, ts])

  const handleRemoveShare = useCallback(
    async (userUid: string) => {
      try {
        await removeShare({ key: addressBookKey, userUid }).unwrap()
        toast.success(ts('removed.string'))
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'data' in err
            ? String((err as { data: { error_msg?: string } }).data?.error_msg ?? '')
            : ''
        toast.error(`${ts('removeError.string')}${msg ? `: ${msg}` : ''}`)
      }
    },
    [removeShare, addressBookKey, ts],
  )

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
        <h2 className="text-lg font-semibold">{ts('title.string')}</h2>
        <p className="text-sm text-muted-foreground">
          {ts('description.string')}
        </p>
      </div>

      {/* Add Share Form */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">{ts('addUser.string')}</h3>

        <div className="flex items-center gap-2">
          <Input
            placeholder={ts('searchPlaceholder.string')}
            value={newUserUid}
            onChange={(e) => setNewUserUid(e.target.value)}
            className="flex-1"
          />

          <Select value={newShareLevel} onValueChange={setNewShareLevel}>
            <SelectTrigger className="w-[140px]">
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
            {ts('addButton.string')}
          </Button>
        </div>
      </div>

      {/* Existing Shares Table */}
      <div>
        <h3 className="mb-2 text-sm font-medium">
          {ts('existingShares.string')} ({shares.length})
        </h3>
        {shares.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {ts('noShares.string')}
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ts('table.user.string')}</TableHead>
                  <TableHead>{ts('table.level.string')}</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shares.map((share: ApiAddressBookShare) => (
                  <TableRow key={share.user_uid}>
                    <TableCell className="font-medium">
                      {share.user_uid}
                    </TableCell>
                    <TableCell>{share.share_level}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveShare(share.user_uid)}
                        disabled={isRemoving}
                        title={ts('removeButton.string')}
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
