'use client'

import { Check, FolderPlus, Mail, MoreVertical, Plus, Users } from 'lucide-react'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { CreateFolderDialog } from '@/features/mails/components/sidebars/create-folder-dialog'
import { useProfile } from '@/features/user-profile'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export function AccountSwitcher() {
  const t = useTranslations('MAILS_COMMONS')
  const { push } = useRouter()
  const { account } = useParams()
  const {
    allMailboxes,
    defaultIdentity,
    canAddExternalAccount,
    isLoading,
    sharedMailboxAccounts,
  } = useProfile()
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false)

  // Index courant depuis l'URL (/u/0/INBOX → 0)
  const currentIndex = account ? Number(account) : 0
  const accountId = String(currentIndex)

  // Check if current account is a shared mailbox (id starts with 'shared-')
  const currentIsShared = account && String(account).startsWith('shared-')

  // Email d'affichage d'une mailbox
  const getAccountEmail = (mailboxId: string): string => {
    // Check if it's a shared mailbox
    if (mailboxId.startsWith('shared-')) {
      const sharedMailbox = sharedMailboxAccounts.find((m) => m.id === mailboxId)
      if (sharedMailbox) {
        return `${sharedMailbox.name} <${sharedMailbox.email}>`
      }
      return ''
    }
    const mailbox = allMailboxes.find((m) => m.id === mailboxId)
    if (!mailbox) return ''
    if (mailboxId === '0') {
      return defaultIdentity?.mail || mailbox.identities?.[0]?.mail || ''
    }
    return mailbox.name || mailbox.identities?.[0]?.mail || ''
  }

  // Find selected mailbox from either regular mailboxes or shared mailboxes
  let selectedMailbox = null
  if (currentIsShared) {
    selectedMailbox = sharedMailboxAccounts.find((m) => m.id === account)
  } else {
    selectedMailbox = allMailboxes[currentIndex] ?? allMailboxes[0]
  }
  const selectedEmail = selectedMailbox ? getAccountEmail(selectedMailbox.id) : ''

  if (isLoading) {
    return (
      <SidebarMenu className="p-0">
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="bg-sidebar group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
            disabled
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:hidden">
              <Mail className="h-5 w-5 opacity-50" />
            </div>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-muted-foreground animate-pulse">…</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu className="p-0">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="bg-sidebar data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:hidden">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden" title={selectedEmail}>
                  <span className="truncate text-sm leading-tight">{selectedEmail.split('@')[0] || selectedEmail}</span>
                  {selectedEmail.includes('@') && (
                    <span className="truncate text-xs leading-tight text-muted-foreground">@{selectedEmail.split('@')[1]}</span>
                  )}
                </div>
                <MoreVertical className="ml-auto h-4 w-4 shrink-0 group-data-[collapsible=icon]:ml-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)]"
              align="start"
            >
              {allMailboxes.map((mailbox, index) => (
                <DropdownMenuItem
                  key={mailbox.id}
                  onClick={() => push(`/u/${index}/INBOX`)}
                  title={getAccountEmail(mailbox.id)}
                >
                  <span className="truncate">{getAccountEmail(mailbox.id)}</span>
                  {!currentIsShared && index === currentIndex && (
                    <Check className="ml-auto h-4 w-4 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}

              {sharedMailboxAccounts.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    {t('account_switcher.shared_mailboxes.string')}
                  </DropdownMenuItem>
                  {sharedMailboxAccounts.map((mailbox) => (
                    <DropdownMenuItem
                      key={mailbox.id}
                      onClick={() => push(`/u/${mailbox.id}/INBOX`)}
                      title={getAccountEmail(mailbox.id)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span className="truncate">{getAccountEmail(mailbox.id)}</span>
                      {currentIsShared && account === mailbox.id && (
                        <Check className="ml-auto h-4 w-4 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                <FolderPlus className="mr-1.5 h-4 w-4" />
                <span>{t('account_switcher.new_folder.string')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Users className="mr-1.5 h-4 w-4" />
                <span>{t('account_switcher.delegate.string')}</span>
              </DropdownMenuItem>

              {canAddExternalAccount && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => push('/user_settings/mail/external_accounts')}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    <span>{t('account_switcher.add_account.string')}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {createFolderOpen && (
        <CreateFolderDialog
          open={createFolderOpen}
          onOpenChange={setCreateFolderOpen}
          accountId={accountId}
          parentPath=""
        />
      )}
    </>
  )
}
