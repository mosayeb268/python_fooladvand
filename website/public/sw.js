// PDA Python Course Service Worker - Offline Caching for Tablet & Web
const CACHE_NAME = 'pda-cache-v2'
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg'
]

// Install event: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activate event: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Skip chrome-extension or other non-http schemes
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            // Only cache same-origin or static assets
            if (event.request.url.includes(self.location.origin) || event.request.url.includes('cdn.jsdelivr.net')) {
              cache.put(event.request, responseToCache)
            }
          })
        }
        return networkResponse
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request)
        if (cachedResponse) {
          return cachedResponse
        }
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html')
        }
        return new Response('آفلاین: این منبع در کش موجود نیست', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      })
  )
})
