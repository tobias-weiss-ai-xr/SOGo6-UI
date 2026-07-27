// SOGo 6 Service Worker
// Provides offline fallback and caches static assets.

const CACHE = 'sogo6-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    })
  )
})

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        // Cache successful responses for static assets
        if (
          response.ok &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => {
            // Only cache if it's a static asset (not API)
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
      // Offline fallback
      if (event.request.mode === 'navigate') {
        return caches.match('/')
      }
      return new Response('Offline', { status: 503 })
    })
  )
})
