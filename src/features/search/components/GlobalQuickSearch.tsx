'use client'

import { useRouter } from '@/lib/i18n/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import {
  Calendar,
  Contact,
  Inbox,
  Loader2,
  Mail,
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
import { useGlobalSearchQuery } from '@/features/search/store/global-search-api'
import type { GlobalSearchContact, GlobalSearchEvent, GlobalSearchUser } from '@/features/search/global-search-types'

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

// Debounce the Cmd+K palette queries so we don't fire a request per keystroke.
function useDebouncedValue(value: string, delayMs = 200): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export default function GlobalQuickSearch({ onClose }: GlobalQuickSearchProps) {
  const t = useTranslations('search')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)

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

  const searchEnabled = debouncedQuery.trim().length >= 2
  const {
    data: searchData,
    isFetching: searchFetching,
  } = useGlobalSearchQuery(
    searchEnabled ? { q: debouncedQuery.trim(), limit: 8 } : { q: '', limit: 8 },
    { skip: !searchEnabled }
  )

  // ── Static navigation items ───────────────────────────────────
  const navItems: QuickSearchItem[] = useMemo(
    () => [
      {
        id: 'goto-inbox',
        label: t('goToInbox'),
        icon: <Inbox className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/u/0/INBOX')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-mail',
        label: t('goToMail'),
        icon: <Mail className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/u/0')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-contacts',
        label: t('goToContacts'),
        icon: <Contact className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/address_books')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-calendar',
        label: t('goToCalendar'),
        icon: <Calendar className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/calendars')
          handleOpenChange(false)
        },
      },
      {
        id: 'goto-settings',
        label: t('goToSettings'),
        icon: <Settings className="h-4 w-4" />,
        type: 'action' as const,
        onSelect: () => {
          router.push('/user_settings')
          handleOpenChange(false)
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, t]
  )

  // ── Contacts section ───────────────────────────────────────────
  const contactItems: QuickSearchItem[] = useMemo(() => {
    return (searchData?.contacts ?? []).map((c: GlobalSearchContact) => ({
      id: `contact-${c.key}`,
      label: c.fullname || c.email,
      description: c.email,
      icon: <Contact className="h-4 w-4" />,
      type: 'contact' as const,
      onSelect: () => {
        if (c.addressbook_key) {
          router.push(`/address_books/${c.addressbook_key}/@visualization/${c.key}`)
        } else {
          router.push('/address_books')
        }
        handleOpenChange(false)
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, router, t])

  // ── Calendar events section ────────────────────────────────────
  const eventItems: QuickSearchItem[] = useMemo(() => {
    return (searchData?.events ?? []).map((e: GlobalSearchEvent) => ({
      id: `event-${e.key}`,
      label: e.title || t('untitledEvent'),
      description: e.date_start ? new Date(e.date_start).toLocaleString() : undefined,
      icon: <Calendar className="h-4 w-4" />,
      type: 'calendar' as const,
      onSelect: () => {
        router.push('/calendars')
        handleOpenChange(false)
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, router, t])

  // ── Users section ──────────────────────────────────────────────
  const userItems: QuickSearchItem[] = useMemo(() => {
    return (searchData?.users ?? []).map((u: GlobalSearchUser) => ({
      id: `user-${u.uid}`,
      label: u.cn || u.uid,
      description: u.mail,
      icon: <User className="h-4 w-4" />,
      type: 'action' as const,
      onSelect: () => {
        handleOpenChange(false)
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, router, t])

  const hasResults =
    contactItems.length > 0 || eventItems.length > 0 || userItems.length > 0

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

          {/* Dynamic results */}
          {searchEnabled && (
            <>
              <CommandSeparator />

              {searchFetching && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('searching')}
                </div>
              )}

              {!searchFetching && !hasResults && (
                <CommandEmpty>{t('noResults')}</CommandEmpty>
              )}

              {contactItems.length > 0 && (
                <CommandGroup heading={t('contactsHeading')}>
                  {contactItems.map((item) => (
                    <CommandItem key={item.id} onSelect={item.onSelect}>
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
              )}

              {eventItems.length > 0 && (
                <CommandGroup heading={t('calendarHeading')}>
                  {eventItems.map((item) => (
                    <CommandItem key={item.id} onSelect={item.onSelect}>
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
              )}

              {userItems.length > 0 && (
                <CommandGroup heading={t('usersHeading')}>
                  {userItems.map((item) => (
                    <CommandItem key={item.id} onSelect={item.onSelect}>
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
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
