// SOGo 6 Service Worker
// Provides offline fallback, asset caching, and push notifications.

const CACHE = 'sogo6-v1'
const STATIC_ASSETS = ['/', '/manifest.json', '/icons/icon.svg']

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
})

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => {
            if (
              !event.request.url.includes('/api/') &&
              !event.request.url.includes('/_next/')
            ) {
              cache.put(event.request, clone)
            }
          })
        }
        return response
      })
    }).catch(() => {
      if (event.request.mode === 'navigate') return caches.match('/')
      return new Response('Offline', { status: 503 })
    })
  )
})

// Push notification
self.addEventListener('push', (event) => {
  let data = { title: 'SOGo', body: '', icon: '/icons/icon.svg', tag: '' }
  try {
    if (event.data) data = { ...data, ...JSON.parse(event.data.text()) }
  } catch {
    data.body = event.data?.text() || ''
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      tag: data.tag,
      data: { url: data.data?.url || '/' },
      vibrate: [200, 100, 200],
    })
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})
