/**
 * Snooze the PWA install prompt for a period of time.
 * Prevents showing the prompt too frequently.
 */
const SNOOZE_LOCAL_STORAGE_KEY = 'sogo6-pwa-install-snoozed';
const DEFAULT_SNOOZE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if the PWA install prompt is currently snoozed.
 */
export function isPwaInstallSnoozed(): boolean {
  if (typeof localStorage === 'undefined') return false;

  try {
    const snoozedUntil = localStorage.getItem(SNOOZE_LOCAL_STORAGE_KEY);
    if (!snoozedUntil) return false;

    const snoozedMs = parseInt(snoozedUntil, 10);
    return Date.now() < snoozedMs;
  } catch {
    return false;
  }
}

/**
 * Snooze the PWA install prompt for the default duration.
 */
export function snoozePwaInstallPromptduration(snoozeMs: number = DEFAULT_SNOOZE_MS): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(SNOOZE_LOCAL_STORAGE_KEY, String(Date.now() + snoozeMs));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear the snooze, allowing the PWA install prompt to be shown again immediately.
 */
export function clearPwaInstallSnooze(): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.removeItem(SNOOZE_LOCAL_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
