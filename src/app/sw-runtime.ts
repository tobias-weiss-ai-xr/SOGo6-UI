/**
 * Service worker runtime utilities.
 * Keep in sync with user-facing routes — no imports from next-intl or other
 * server-only modules.
 */

/** Return true for navigation requests (mode === 'navigate' OR TYPICAL document fetches). */
export function isNavigationRequest(
  request: Pick<Request, 'mode' | 'destination'>
): boolean {
  return request.mode === 'navigate' || request.destination === 'document';
}

/** Extract the pathname from a Request url. */
export function pathnameFromRequestUrl(requestUrl: string): string {
  try {
    return new URL(requestUrl, 'http://localhost').pathname;
  } catch {
    return '';
  }
}

/** Known offline-capable locales — keep in sync with next-intl config. */
export const OFFLINE_FALLBACK_LOCALES = ['en', 'de', 'fr', 'es'] as const;

/** Pick a locale for the offline fallback: prefers request path, else default. */
export function offlineFallbackPath(requestUrl: string): string {
  const path = pathnameFromRequestUrl(requestUrl);
  const first = path.split('/').filter(Boolean)[0];
  if (first && (OFFLINE_FALLBACK_LOCALES as readonly string[]).includes(first)) {
    return `/${first}/~offline`;
  }
  return '/~offline';
}

/** Return true if this path is the precached ‘auth/login’ route for a known locale. */
export function isPrecachedDocumentPath(pathname: string): boolean {
  return /\/~offline\/?$/.test(pathname);
}

/** Filter out broken precache URLs that 404 at SW install time. */
export function filterPrecacheEntries<T extends string | { url: string }>(
  entries: T[] | undefined
): T[] {
  return (entries ?? []).filter((entry) => {
    const url = typeof entry === 'string' ? entry : entry.url;
    if (!url) return true;
    const path = url.replace(/^https?:\/\/[^/]+/i, '').split('?')[0] ?? url;
    return !isBrokenPrecacheUrl(path);
  });
}

/** URLs that we know 404 in the precache manifest. */
function isBrokenPrecacheUrl(path: string): boolean {
  return path === '/robots.txt' || path.startsWith('/fonts/OpenDyslexic');
}
