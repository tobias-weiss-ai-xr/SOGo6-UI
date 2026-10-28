// Flags and configuration
export {
  isPwaCalendarCacheEnabled,
  isPwaEnabled,
  isPwaMailCacheEnabled,
  isPwaOutboxEnabled,
  isPwaBgSyncEnabled,
} from './flags';
export { pwaStartUrl } from './pwa-start-url';

// Types
export type {
  OutboxRecord,
} from './types';
export {
  ATTACHMENT_MAX_BYTES,
  ATTACHMENT_MAX_COUNT,
  MAIL_CACHE_BODIES_MAX,
  MAIL_CACHE_HEADERS_PER_FOLDER,
  MAIL_CACHE_TTL_MS,
} from './types';

// Network utilities
export {
  retryOfflineNavigation,
  useNetworkStatus,
} from './network';
export type { NetworkStatus } from './network';

// Components
export {
  default as OfflineFallbackShell,
  type OfflineFallbackShellProps,
} from './components/offline-fallback-shell';
export {
  InstallPwaPrompt,
  type InstallPwaPromptProps,
} from './components/install-pwa-prompt';
export {
  default as OfflineBanner,
  type OfflineBannerProps,
} from './components/offline-banner';
export {
  default as LoginOfflineBanner,
  type LoginOfflineBannerProps,
} from './components/login-offline-banner';
export {
  default as OfflineUnavailable,
  type OfflineUnavailableProps,
} from './components/offline-unavailable';
export {
  default as OfflineModuleGate,
  type OfflineModuleGateProps,
} from './components/offline-module-gate';
export {
  PwaStatusBar,
  type PwaStatusBarProps,
} from './components/pwa-status-bar';
export {
  PwaUpdateToast,
  type PwaUpdateToastProps,
} from './components/pwa-update-toast';
export { pwaUpdateReload } from './components/pwa-update-reload';
export {
  SerwistProviderGate,
  type SerwistProviderGateProps,
} from './components/serwist-provider-gate';

// Database
export {
  clearOutbox,
  deleteOutboxRecord,
  getAllOutboxRecords,
  getOutboxRecord,
  saveOutboxRecord,
  wipeOfflineCache,
} from './db';

// Authentication
export { getAuthToken } from './auth';

// Outbox
export {
  OutboxCoordinator,
  outboxEventBus,
  outboxFlushService,
  type OutboxAction,
  type OutboxEvent,
  type OutboxEventListener,
} from './outbox';

// Utilities
export {
  cacheClock,
  isExpired,
  setCacheClock,
} from './utils';
export { blobToBase64 } from './utils/blob-to-base64';
export { outboxLastErrorSnippet } from './utils/outbox-last-error-snippet';
export { outboxToListItem } from './utils/outbox-to-list-item';
export {
  getShareFallbackHtml,
  generatePendingShareId,
  parseMailto,
  type PendingShare,
  type ParsedMailto,
} from './utils/share';

// Hooks
export { useSyncOnlineStatus } from './hooks';
// Context
export {
  OfflineNavProvider as OfflineNavContextProvider,
  useOfflineNav,
} from './offline-nav-context';
// Install snooze
export {
  clearPwaInstallSnooze,
  isPwaInstallSnoozed,
  snoozePwaInstallPromptduration,
} from './install-snooze';
