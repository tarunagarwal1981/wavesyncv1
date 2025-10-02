const CACHE_NAME = 'wavesync-static-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const STATIC_ROUTES = [
  '/static',
  '/_next/static',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Static files - cache first
  if (STATIC_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages - network first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cache_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first failed:', error);
    
    // For images, return a fallback image
    if (request.destination === 'image') {
      return new Response('', { status: 404 });
    }
    
    // For offline HTML pages, show the offline page
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network first failed:', error);
    
    // Try to serve from cache on network failure
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For API calls, return a structured offline response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'You are offline. Please check your internet connection.',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch((error) => {
      console.error('Network request failed:', error);
      return cachedResponse;
    });

  return cachedResponse || networkResponsePromise;
}

// Handle notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'update') {
    // Send message to update the app
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: 'update' });
      });
    });
  } else {
    // Navigate to the app
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'WaveSync', {
        body: data.body || 'You have a new notification',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data.data || {},
        actions: data.actions || [],
        tag: data.tag || '',
      })
    );
  }
});
