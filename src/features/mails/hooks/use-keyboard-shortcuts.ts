'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'

interface UseKeyboardShortcutsOptions {
  /** Current folder path (e.g. "INBOX") */
  folder?: string
  /** IDs of mails in the current list, in display order */
  mailIds?: string[]
  /** Currently selected mail ID (from Redux or local state) */
  selectedMailId?: string | null
  /** Called to select the next/previous mail */
  onSelectMail?: (id: string) => void
  /** Called to open the selected mail */
  onOpenMail?: (id: string) => void
  /** Called to archive the mail */
  onArchiveMail?: (id: string) => void
  /** Called to delete the mail */
  onDeleteMail?: (id: string) => void
  /** Called to toggle flag/star */
  onToggleFlag?: (id: string) => void
  /** Called to reply */
  onReply?: (id: string) => void
  /** Called to reply all */
  onReplyAll?: (id: string) => void
  /** Whether shortcuts are active (e.g. not in a text input) */
  enabled?: boolean
}

/**
 * Gmail-style keyboard shortcuts for the mail list.
 *
 * | Key | Action |
 * |-----|--------|
 * | `j` / `k` | Navigate next / previous |
 * | `o` / `Enter` | Open selected |
 * | `e` | Archive |
 * | `#` | Delete |
 * | `s` | Toggle star/flag |
 * | `r` | Reply |
 * | `a` | Reply all |
 * | `/` | Focus search |
 * | `u` | Go to inbox |
 *
 * Shortcuts are disabled when focus is inside an input/textarea.
 */
export function useKeyboardShortcuts({
  folder,
  mailIds = [],
  selectedMailId,
  onSelectMail,
  onOpenMail,
  onArchiveMail,
  onDeleteMail,
  onToggleFlag,
  onReply,
  onReplyAll,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const router = useRouter()

  const currentIndex = selectedMailId ? mailIds.indexOf(selectedMailId) : -1

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if focus is inside an input / textarea / contenteditable
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
        return
      }

      // Cmd/Ctrl + K is handled by GlobalQuickSearch
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') return

      switch (e.key) {
        // ── Navigation ───────────────────────────────────────
        case 'j':
        case 'J': {
          e.preventDefault()
          const nextIdx = currentIndex + 1
          if (nextIdx < mailIds.length && onSelectMail) {
            onSelectMail(mailIds[nextIdx])
          }
          break
        }
        case 'k':
        case 'K': {
          e.preventDefault()
          const prevIdx = currentIndex - 1
          if (prevIdx >= 0 && onSelectMail) {
            onSelectMail(mailIds[prevIdx])
          }
          break
        }
        case 'o':
        case 'Enter': {
          if (selectedMailId && onOpenMail) {
            e.preventDefault()
            onOpenMail(selectedMailId)
          }
          break
        }
        case 'u': {
          e.preventDefault()
          router.push('/mail/inbox')
          break
        }
        case '/': {
          e.preventDefault()
          // Focus the search input — dispatched via custom event
          document.dispatchEvent(new CustomEvent('focus-search'))
          break
        }

        // ── Actions ──────────────────────────────────────────
        case 'e': {
          if (selectedMailId && onArchiveMail) {
            e.preventDefault()
            onArchiveMail(selectedMailId)
          }
          break
        }
        case '#': {
          if (selectedMailId && onDeleteMail) {
            e.preventDefault()
            onDeleteMail(selectedMailId)
          }
          break
        }
        case 's':
        case 'S': {
          if (selectedMailId && onToggleFlag) {
            e.preventDefault()
            onToggleFlag(selectedMailId)
          }
          break
        }
        case 'r':
        case 'R': {
          if (selectedMailId && onReply) {
            e.preventDefault()
            onReply(selectedMailId)
          }
          break
        }
        case 'a':
        case 'A': {
          if (selectedMailId && onReplyAll) {
            e.preventDefault()
            onReplyAll(selectedMailId)
          }
          break
        }
      }
    },
    [
      mailIds,
      currentIndex,
      selectedMailId,
      onSelectMail,
      onOpenMail,
      onArchiveMail,
      onDeleteMail,
      onToggleFlag,
      onReply,
      onReplyAll,
      router,
    ]
  )

  useEffect(() => {
    if (!enabled) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

export default useKeyboardShortcuts
