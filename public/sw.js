/**
 * Service Worker for SOGo 6 — PWA + Push Notifications
 *
 * Handles:
 *  - App shell caching (offline support)
 *  - Network-first for navigation with offline fallback
 *  - Push notifications, notification clicks, subscription changes
 *  - Background sync (optional)
 */

const CACHE_NAME = 'sogo6-v2';
const OFFLINE_URL = '/offline';
const APP_SHELL = ['/', '/en', '/en/u/0/INBOX', '/en/calendars', OFFLINE_URL];

// Listen for install event — precache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => {
        console.error('Cache failed:', err);
      })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Listen for activate event — clean up old caches, claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Network-first with cache fallback; never cache API calls.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Never cache API / SSE / fakeApi / env endpoints.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/fakeApi/') ||
    url.pathname.startsWith('/env')
  ) {
    return;
  }

  // For navigations: network-first, fall back to the offline page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(OFFLINE_URL).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // For static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.status >= 200 && response.status < 400) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Listen for push events
self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data?.json();
  } catch (err) {
    console.error('Error parsing push event data:', err);
    data = {};
  }

  const notificationData = {
    title: data?.title || 'SOGo6 Notification',
    body: data?.body || 'You have a new notification',
    icon: data?.icon || '/icons/icon-192.png',
    badge: data?.badge || '/icons/badge-72x72.png',
    data: data?.data || {},
    actions: data?.actions || [],
  };

  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'PUSH_RECEIVED', payload: notificationData });
      });
      return self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: { timestamp: Date.now(), url: notificationData.data.url, ...notificationData.data },
        actions: notificationData.actions,
      });
    })
  );
});

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification.data;
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          payload: { url: data.url, timestamp: data.timestamp, ...data },
        });
      });
      const url = data.url || '/en';
      const existing = clients.find((c) => 'focus' in c);
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});

// Listen for notification close events
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data;
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_CLOSE',
          payload: { id: data.id, timestamp: data.timestamp },
        });
      });
    })
  );
});

// Listen for push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SUBSCRIPTION_CHANGE',
          payload: { endpoint: event.oldSubscription?.endpoint },
        });
      });
      return event.newSubscription;
    })
  );
});

// Precache assets on request from the client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRECACHE') {
    const urls = event.data.payload?.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urls))
    );
  }
});

// Background sync support (optional)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(syncData());
    }
  });
}

async function syncData() {
  // Sync data when online — placeholder for future offline write-back.
}
