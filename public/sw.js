const CACHE_NAME = 'quickshed-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/og-image.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll but skip assets that might fail (like root /)
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Some assets failed to cache during install', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip API, Next.js internal routes, and navigation requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return;

  // Only cache known static file types — let navigation requests pass through
  const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff2?|css|js|json)$/);
  const isPreCached = STATIC_ASSETS.includes(url.pathname);

  if (!isStaticAsset && !isPreCached) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Only cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      }).catch((err) => {
        // If fetch fails for a static asset, return a basic offline response
        console.warn('SW: Fetch failed for', url.pathname, err);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
