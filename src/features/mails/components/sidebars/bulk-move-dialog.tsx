'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import type { ImapFolder } from '../../mails-types'
import { useGetFoldersQuery } from '../../store/mails-api'

export interface BulkMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  currentFolder: string
  count: number
  submitting: boolean
  onSubmit: (destination: string) => void
}

export function flattenFolderPaths(
  folders: ImapFolder[],
  excludePath: string,
  prefix = ''
): { path: string; label: string }[] {
  const result: { path: string; label: string }[] = []

  for (const folder of folders) {
    if (folder.path === excludePath) continue
    if (folder.path.startsWith(`${excludePath}/`)) continue

    const label = prefix ? `${prefix} / ${folder.name}` : folder.name
    if (folder.selectable !== false) {
      result.push({ path: folder.path, label })
    }

    const nested = folder.subfolders ?? folder.children ?? []
    if (nested.length > 0) {
      result.push(...flattenFolderPaths(nested, excludePath, label))
    }
  }

  return result
}

export function BulkMoveDialog({
  open,
  onOpenChange,
  accountId,
  currentFolder,
  count,
  submitting,
  onSubmit,
}: BulkMoveDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const { data: folders = [] } = useGetFoldersQuery({ accountId })
  const [destination, setDestination] = useState('')

  const options = useMemo(
    () => flattenFolderPaths(folders, currentFolder),
    [folders, currentFolder]
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('folders.actions.move_mails_dialog.title.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('folders.actions.move_mails_dialog.description.string', {
              count,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Select value={destination} onValueChange={setDestination}>
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                'folders.actions.move_mails_dialog.placeholder.string'
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.path} value={option.path}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>
            {t('folders.actions.move_mails_dialog.cancel.string')}
          </AlertDialogCancel>
          <Button
            disabled={submitting || !destination}
            onClick={() => onSubmit(destination)}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('folders.actions.move_mails_dialog.confirm.string')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
