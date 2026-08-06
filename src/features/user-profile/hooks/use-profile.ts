import { useAppSelector } from '@/lib/redux/hooks'
import {
  useGetUserProfileQuery,
  useGetUserSharedMailboxesQuery,
} from '../store/profile-api'

/**
 * Custom hook for easy access to profile data
 * Combines data from auth.user (uid, cn, email) with profile API and shared mailboxes
 */
export function useProfile() {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErr,
    refetch: refetchProfile,
  } = useGetUserProfileQuery()

  const {
    data: sharedMailboxes = [],
    isLoading: sharedLoading,
    isError: sharedError,
    error: sharedErr,
    refetch: refetchShared,
  } = useGetUserSharedMailboxesQuery()

  // Get user info from Redux auth state
  const authUser = useAppSelector((state) => state.auth.user)

  // Extract domain from uid (e.g. "user@sogo.nu" → "sogo.nu")
  const domain = authUser?.uid?.includes('@') ? authUser.uid.split('@')[1] : ''

  // Separate main account vs external accounts
  const mainAccount = profile?.mailboxes.find((m) => m.id === '0')
  const externalAccounts = profile?.mailboxes.filter((m) => m.id !== '0') || []

  // Default identity
  const defaultIdentity = mainAccount?.identities.find((id) => id.isDefault)

  // Combine regular mailboxes with shared mailboxes for the account switcher
  // Shared mailboxes are marked with a special id to distinguish them
  const sharedMailboxAccounts = sharedMailboxes.map((sm) => ({
    id: `shared-${sm.id}`,
    name: sm.name,
    email: sm.email,
    description: sm.description,
    isShared: true,
    sharedMailbox: sm,
    identities: [
      {
        mail: sm.email,
        name: sm.name,
        replyTo: '',
        isDefault: true,
        signatures: {},
      },
    ],
    receipts: {},
    certificates: {},
  }))

  return {
    // Raw data
    profile,
    isLoading: profileLoading || sharedLoading,
    isError: profileError || sharedError,
    error: profileErr || sharedErr,
    refetchProfile,
    refetchShared,

    // User info (combined auth.user + extracted domain)
    user: authUser
      ? {
          ...authUser,
          domain,
        }
      : null,

    // Mailboxes
    mainAccount,
    externalAccounts,
    allMailboxes: profile?.mailboxes || [],
    sharedMailboxes,
    sharedMailboxAccounts,
    allaccountsIncludingShared: [...(profile?.mailboxes || []), ...sharedMailboxAccounts],
    defaultIdentity,

    // Preferences shortcuts
    preferences: profile?.prefs,
    language: profile?.prefs?.USER_GENERAL?.SOGO_U_LANGUAGE,
    timezone: profile?.prefs?.USER_GENERAL?.SOGO_U_TIMEZONE,
    firstModule: profile?.prefs?.USER_GENERAL?.SOGO_U_FIRST_MODULE,
    mfaEnabled: profile?.prefs?.USER_SECURITY?.SOGO_U_MFA_ENABLE,

    // UI settings (domain) - Feature toggles
    uiSettings: profile?.ui,
    canAddExternalAccount: profile?.ui?.SOGO_D_ALLOW_EXT_MAIL_ACCOUNT ?? false,
    identitiesEnabled: profile?.ui?.SOGO_D_IDENTITIES_ENABLED ?? false,
    customFromEnabled:
      profile?.ui?.SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED ?? false,
    moduleAccess: profile?.ui?.SOGO_D_MODULE_ACCESS || [],
    mfaAvailable: profile?.ui?.SOGO_D_LOGIN_MFA ?? false,
    passwordChangeEnabled: profile?.ui?.SOGO_D_PWD_CHANGE_ENABLED ?? false,
    forwardEnabled: profile?.ui?.SOGO_D_FORWARD_ENABLED ?? false,
    vacationEnabled: profile?.ui?.SOGO_D_VACATION_ENABLED ?? false,
    vacationAllowResponseAlways:
      profile?.ui?.SOGO_D_VACATION_ALLOW_RESPONSE_ALWAYS ?? false,
    mailFilteringEnabled: profile?.ui?.SOGO_D_MAIL_FILTERING_ENABLED ?? false,
    notifyEnabled: profile?.ui?.SOGO_D_NOTIFY_ENABLED ?? false,
    mailPurgeAllow: profile?.ui?.SOGO_D_MAIL_PURGE_ALLOW ?? false,
    mailMaxRecipient: profile?.ui?.SOGO_D_MAIL_MAX_RECIPIENT ?? 0,
    jitsiLinkEnabled: profile?.ui?.SOGO_D_JITSI_LINK_ENABLED ?? false,
    jitsiBaseUrl: profile?.ui?.SOGO_D_JITSI_BASE_URL ?? null,
    folderSharingDisabled: profile?.ui?.SOGO_D_FOLDER_DISABLE_SHARING ?? false,
    draftAutosaveTimer: profile?.ui?.SOGO_D_MAIL_DRAFT_AUTOSAVE ?? 5, // Default to 5s if not set
  }
}
