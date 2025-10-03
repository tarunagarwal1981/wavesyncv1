// Service Worker for WaveSync PWA
// This file is imported in the main app to register the service worker

const CACHE_NAME = 'wavesync-v1';
const STATIC_CACHE = 'wavesync-static-v1';
const DYNAMIC_CACHE = 'wavesync-dynamic-v1';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add more static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v1/auth',
  '/api/v1/certificates',
  '/api/v1/documents',
  '/api/v1/notifications',
  // Add more API endpoints as needed
];

// Network-first cache strategy for dynamic content
const DYNAMIC_ROUTES = [
  '/api/v1/certificates',
  '/api/v1/documents',
  '/api/v1/notifications',
];

// Static-first cache strategy for assets
const STATIC_ROUTES = [
  '/static',
  '/_next/static',
];

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                if ('showNotification' in Notification.prototype) {
                  registration.showNotification('Update Available', {
                    body: 'New version of WaveSync is available',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-72x72.png',
                    actions: [
                      {
                        action: 'update',
                        title: 'Update',
                      },
                      {
                        action: 'dismiss',
                        title: 'Dismiss',
                      }
                    ]
                  });
                }
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }
}

// Service worker script content (to be written to public/sw.js)
export const serviceWorkerScript = `
const CACHE_NAME = '${STATIC_CACHE}';
const STATIC_ASSETS = ${JSON.stringify(STATIC_ASSETS)};

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

  // Network first for API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
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
      const cache = await caches.open(CACHE_NAME);
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
`;

// Cache management utilities
export class CacheManager {
  static async clearCache() {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }

  static async getCacheSize(): Promise<number> {
                    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  }

  static async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const cacheNames = await caches.keys();
    const expirationTime = Date.now() - maxAge;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const cacheResponse = await cache.match(request);
        if (cacheResponse) {
          const cachedDate = new Date(cacheResponse.headers.get('date') || '');
          const age = Date.now() - cachedDate.getTime();

          if (age > expirationTime) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}



