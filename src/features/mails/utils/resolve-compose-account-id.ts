import type { useProfile } from '@/features/user-profile'

export function resolveComposeAccountId(
  identityMail: string | undefined,
  mainAccount: ReturnType<typeof useProfile>['mainAccount'],
  externalAccounts: ReturnType<typeof useProfile>['externalAccounts'],
  sharedMailboxAccounts: ReturnType<typeof useProfile>['sharedMailboxAccounts'] = []
): string {
  if (!identityMail) return '0'

  // Check if this is a shared mailbox email
  const sharedMailbox = sharedMailboxAccounts?.find((m) => m.email === identityMail)
  if (sharedMailbox) return sharedMailbox.id

  const inMain = mainAccount?.identities?.some((id) => id.mail === identityMail)
  if (inMain && mainAccount?.id) return String(mainAccount.id)

  for (const account of externalAccounts) {
    const inExternal = account.identities?.some(
      (id) => id.mail === identityMail
    )
    if (inExternal && account.id) return String(account.id)
  }

  return '0'
}
