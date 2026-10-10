/**
 * Reload the page to activate a discarded service worker and thus a new PWA version.
 * Called from the service worker message handler when a new version is waiting.
 */
export function pwaUpdateReload(): void {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
