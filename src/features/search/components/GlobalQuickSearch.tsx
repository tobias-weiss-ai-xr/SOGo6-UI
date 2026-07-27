'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Contact,
  Inbox,
  Mail,
  MessageSquare,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

export interface QuickSearchItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  onSelect: () => void
  type: 'mail' | 'contact' | 'calendar' | 'settings' | 'action'
}

interface GlobalQuickSearchProps {
  onClose?: () => void
}

export default function GlobalQuickSearch({ onClose }: GlobalQuickSearchProps) {
  const t = useTranslations('search')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Toggle the command palette via Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setQuery('')
      onClose?.()
    }
  }

  // ── Static navigation items ───────────────────────────────────
  const navItems: QuickSearchItem[] = useMemo(
    () => [
      {
        id: 'goto-inbox',
        label: t('goToInbox'),
        icon: <Inbox className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/mail/inbox')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-mail',
        label: t('goToMail'),
        icon: <Mail className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/mail')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-contacts',
        label: t('goToContacts'),
        icon: <Contact className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/contacts')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-calendar',
        label: t('goToCalendar'),
        icon: <Calendar className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/calendar')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-settings',
        label: t('goToSettings'),
        icon: <Settings className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/settings')
          handleOpenChange(false)
        },
      },
    ],
    [router, t]
  )

  // ── Dynamic search results ────────────────────────────────────
  const mailResults: QuickSearchItem[] = useMemo(() => {
    if (!query || query.length < 2) return []
    // TODO: wire up to searchMails API endpoint
    return [
      {
        id: 'search-mail',
        label: t('searchInMail', { query }),
        icon: <Search className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push(`/mail/search?q=${encodeURIComponent(query)}`)
          handleOpenChange(false)
        },
      },
    ]
  }, [query, router, t])

  return (
    <>
      {/* Screen reader hint */}
      <span className="sr-only">
        {t('openCommandPalette')}
      </span>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder={t('placeholder')}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{t('noResults')}</CommandEmpty>

          {/* Navigation shortcuts */}
          <CommandGroup heading={t('navigate')}>
            {navItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={item.onSelect}
              >
                {item.icon}
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Search results */}
          {query.length >= 2 && mailResults.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('results')}>
                {mailResults.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={item.onSelect}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.description && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
