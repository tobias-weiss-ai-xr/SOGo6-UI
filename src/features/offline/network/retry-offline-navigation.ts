/**
 * Retry a navigation that failed because the service worker could not reach the network.
 * When invoked from the offline fallback page, attempts to load the start URL.
 */
export function retryOfflineNavigation(startUrl: string): void {
  if (typeof window === 'undefined') return;
  window.location.href = startUrl;
}
