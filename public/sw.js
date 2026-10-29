const CACHE_NAME = 'kalavies-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/KALAVIES_Jewellery_Logo.svg',
  '/offline',
]

// Install event: cache static shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event: Network-first for dynamic content, cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Never cache API, mutation requests, or payment/checkout calls
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.includes('/checkout') ||
    request.url.includes('/admin')
  ) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets and images
        if (
          response.status === 200 &&
          (request.url.includes('/images/') ||
            request.url.includes('.svg') ||
            request.url.includes('.css') ||
            request.url.includes('.js'))
        ) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(request)
        if (cachedResponse) return cachedResponse

        // Return offline fallback page for navigation requests
        if (request.mode === 'navigate') {
          const offlinePage = await cache.match('/offline')
          if (offlinePage) return offlinePage
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' })
      })
  )
})
