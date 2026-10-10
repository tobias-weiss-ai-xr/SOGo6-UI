/// <reference lib="esnext" />
/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist } from 'serwist';
import {
  filterPrecacheEntries,
  isNavigationRequest,
  isPrecachedDocumentPath,
  OFFLINE_FALLBACK_LOCALES,
  offlineFallbackPath,
  pathnameFromRequestUrl,
} from './sw-runtime';
import { handleShareTarget, isShareTargetRequest } from './sw-share';

const OUTBOX_FLUSH_SYNC_TAG = 'outbox-flush';

// 7 days in seconds
const SEVEN_DAYS = 7 * 24 * 60 * 60;
// 30 days in seconds
const THIRTY_DAYS = 30 * 24 * 60 * 60;

const expire = (maxEntries: number, maxAgeSeconds: number) =>
  new ExpirationPlugin({ maxEntries, maxAgeSeconds });

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: filterPrecacheEntries(self.__SW_MANIFEST),
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // API routes - always network
    {
      matcher: /\/(?:api|fakeApi)\/.*/i,
      handler: new NetworkOnly(),
    },
    // CKEditor assets - cached
    {
      matcher: /ckeditor5|ck-editor|ckeditor/i,
      handler: new CacheFirst({
        cacheName: 'ckeditor-assets',
        plugins: [expire(64, THIRTY_DAYS)],
      }),
    },
    // Next.js static files
    {
      matcher: /\/_next\/static\/.*/i,
      handler: new CacheFirst({
        cacheName: 'next-static',
        plugins: [expire(128, SEVEN_DAYS)],
      }),
    },
    // Static images
    {
      matcher: /\/(?:icons|images)\/.*/i,
      handler: new CacheFirst({
        cacheName: 'static-images',
        plugins: [expire(64, THIRTY_DAYS)],
      }),
    },
    // Manifest file
    {
      matcher: /\/manifest\.webmanifest/i,
      handler: new NetworkFirst({
        cacheName: 'manifest',
        networkTimeoutSeconds: 3,
      }),
    },
    // Precached pages (login, offline)
    {
      matcher: ({ request }) => {
        if (!isNavigationRequest(request)) return false;
        return isPrecachedDocumentPath(pathnameFromRequestUrl(request.url));
      },
      handler: new CacheFirst({
        cacheName: 'pages',
        plugins: [expire(16, SEVEN_DAYS)],
      }),
    },
    // Navigation requests - network first with offline fallback
    {
      matcher: ({ request }) => isNavigationRequest(request),
      handler: new NetworkFirst({
        cacheName: 'navigations',
        networkTimeoutSeconds: 10,
        plugins: [expire(32, SEVEN_DAYS)],
      }),
    },
    // Fallback: cache everything else
    {
      matcher: /.*/i,
      method: 'GET',
      handler: new NetworkFirst({
        cacheName: 'misc',
        networkTimeoutSeconds: 5,
        plugins: [expire(32, SEVEN_DAYS)],
      }),
    },
  ],
  fallbacks: {
    entries: [
      ...OFFLINE_FALLBACK_LOCALES.map((locale) => ({
        url: `/${locale}/~offline`,
        matcher: ({ request }: { request: Request }) => {
          if (!isNavigationRequest(request)) return false;
          const path = pathnameFromRequestUrl(request.url).replace(/\/$/, '');
          return path === `/${locale}/auth/login`;
        },
      })),
      ...OFFLINE_FALLBACK_LOCALES.map((locale) => ({
        url: `/${locale}/~offline`,
        matcher: ({ request }: { request: Request }) => {
          return (
            isNavigationRequest(request) &&
            offlineFallbackPath(request.url) === `/${locale}/~offline`
          );
        },
      })),
      {
        url: '/~offline',
        matcher: ({ request }: { request: Request }) => {
          return isNavigationRequest(request);
        },
      },
    ],
  },
});

// Handle Web Share Target API requests
self.addEventListener('fetch', (event) => {
  if (!isShareTargetRequest(event.request)) return;
  event.respondWith(handleShareTarget(event.request));
});

serwist.addEventListeners();

// Handle skip waiting messages
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

// Background sync for outbox flush
self.addEventListener('sync', ((event: ExtendableEvent) => {
  const syncEvent = event as unknown as {
    tag: string;
    waitUntil: (p: Promise<unknown>) => void;
  };
  if (syncEvent.tag === OUTBOX_FLUSH_SYNC_TAG) {
    syncEvent.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'OUTBOX_FLUSH' });
        }
      })
    );
  }
}) as EventListener);
