// Service Worker for Menu Magi PWA
// Provides offline support and background sync

const CACHE_NAME = 'menu-magi-v1';
const RUNTIME_CACHE = 'menu-magi-runtime';

// Assets to cache on install
const urlsToCache = [
  '/',
  '/offline.html',
  '/customer/table',
  '/customer/menu',
  '/owner/dashboard',
  '/owner/orders',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip Supabase API calls (always need fresh data)
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Network-first strategy for HTML pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache, then offline page
          return caches.match(request)
            .then((cached) => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }
          
          return fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background Sync for offline orders
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders());
  }
});

// Sync offline orders to server
async function syncOfflineOrders() {
  try {
    const db = await openOrdersDB();
    const pendingOrders = await db.getAll('pending');
    
    console.log('[SW] Syncing', pendingOrders.length, 'offline orders');
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        });
        
        if (response.ok) {
          // Order synced successfully - remove from IndexedDB
          await db.delete('pending', order.id);
          console.log('[SW] Order synced:', order.id);
          
          // Show notification
          self.registration.showNotification('Order Submitted', {
            body: `Your order for ₹${order.total} was submitted successfully!`,
            icon: '/icon-192.png',
            badge: '/badge.png',
            tag: `order-${order.id}`,
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// IndexedDB helper for offline orders
function openOrdersDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MenuMagiOrders', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve({
      db: request.result,
      getAll: function(storeName) {
        return new Promise((res, rej) => {
          const tx = this.db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => res(getAllRequest.result);
          getAllRequest.onerror = () => rej(getAllRequest.error);
        });
      },
      delete: function(storeName, key) {
        return new Promise((res, rej) => {
          const tx = this.db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => res();
          deleteRequest.onerror = () => rej(deleteRequest.error);
        });
      },
    });
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id' });
      }
    };
  });
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Menu Magi';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service Worker loaded');
