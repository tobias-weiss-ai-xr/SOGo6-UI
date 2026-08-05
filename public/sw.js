/**
 * Service Worker for Push Notifications
 * Handles push events, notifications, and background sync
 */

const CACHE_NAME = 'sogo6-v1';
const OFFLINE_URL = '/offline';

// Listen for install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache essential assets
      return cache.addAll([
        '/',
        '/_next/static/css/*.css',
        '/_next/static/chunks/*.js',
        '/_next/static/*.js',
      ]).catch((err) => {
        console.error('Cache failed:', err);
      });
    })
  );
  
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Listen for activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      }),
      // Claim clients
      self.clients.claim(),
    ])
  );
});

// Listen for fetch events (for caching strategies)
self.addEventListener('fetch', (event) => {
  // Cache API responses for offline use (optional)
  // Note: Most API endpoints should not be cached
  if (event.request.method !== 'GET') return;
  
  // Don't cache API requests
  if (event.request.url.includes('/api/') || event.request.url.includes('/fakeApi/')) {
    return;
  }
  
  // Don't cache non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Serve from cache if available, otherwise fetch and cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        // Only cache successful responses
        if (response.status >= 200 && response.status < 400) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return caches.match(OFFLINE_URL);
      });
    })
  );
});

// Listen for push events
self.addEventListener('push', (event) => {
  // Check if we have data in the push event
  let data;
  try {
    data = event.data?.json();
  } catch (err) {
    console.error('Error parsing push event data:', err);
    data = {
      title: 'New Notification',
      body: 'You have a new notification',
      icon: '/icons/icon-192x192.png',
    };
  }
  
  // Default notification data
  const notificationData = {
    title: data?.title || 'SOGo6 Notification',
    body: data?.body || 'You have a new notification',
    icon: data?.icon || '/icons/icon-192x192.png',
    badge: data?.badge || '/icons/badge-72x72.png',
    data: data?.data || {},
    actions: data?.actions || [],
  };
  
  // Send message to all clients
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        // Send the push event to the client
        client.postMessage({
          type: 'PUSH_RECEIVED',
          payload: notificationData,
        });
      });
      
      // Show notification
      return self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: {
          timestamp: Date.now(),
          url: notificationData.data.url,
          ...notificationData.data,
        },
        actions: notificationData.actions,
      });
    })
  );
});

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification.data;
  
  // Close the notification
  event.notification.close();
  
  // Handle the click
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Send click event to all clients
      clients.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          payload: { url: data.url, timestamp: data.timestamp, ...data },
        });
      });
      
      // Focus or open a client
      if (clients && clients.length) {
        // Focus the first client
        clients[0].focus();
      } else {
        // Open a new window
        if (data.url) {
          self.clients.openWindow(data.url);
        } else {
          self.clients.openWindow('/');
        }
      }
    })
  );
});

// Listen for notification close events
self.addEventListener('notificationclose', (event) => {
  const notification = event.notification;
  const data = notification.data;
  
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
    Promise.all([
      // Send subscription change to all clients
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SUBSCRIPTION_CHANGE',
            payload: { endpoint: event.oldSubscription?.endpoint },
          });
        });
      }),
      // Re-subscribe with the new subscription
      event.newSubscription,
    ])
  );
});

// Precache essential assets on message from client
self.addEventListener('message', (event) => {
  if (event.data.type === 'PRECACHE') {
    const urls = event.data.payload?.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});

// Background sync support (optional)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    // Handle background sync events
    switch (event.tag) {
      case 'sync-data':
        event.waitUntil(syncData());
        break;
      default:
        // Ignore
        break;
    }
  });
}

async function syncData() {
  // sync data when online
}
