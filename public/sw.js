// Alfred Major — Service Worker PWA
const CACHE_NAME = 'alfred-major-v1';

// Fichiers à mettre en cache pour le mode hors ligne
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
];

// ── INSTALLATION ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATION ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ── FETCH (cache first pour les assets statiques) ──
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes API
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// ── NOTIFICATIONS PUSH ──
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: '🎩 Alfred Major',
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
    };
  }

  const options = {
    body: data.body || 'Nouvelle notification Alfred Major',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard',
      propertyName: data.propertyName || '',
    },
    actions: [
      {
        action: 'view',
        title: 'Voir le détail',
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
      },
    ],
    requireInteraction: data.urgent || false, // Reste affichée si urgence
    tag: data.tag || 'alfred-notification',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🎩 Alfred Major — Urgence', options)
  );
});

// ── CLIC SUR LA NOTIFICATION ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si l'app est déjà ouverte, on focus
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Sinon on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
