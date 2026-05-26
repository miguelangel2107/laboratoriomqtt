const CACHE_NAME = 'monitor-esp32-v3';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

// Instalar el Service Worker y guardar los archivos iniciales
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Limpiar cachés viejos al actualizar
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Estrategia: Red primero, luego caché
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si la red funciona, actualiza el caché y devuelve la respuesta de internet
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Si no hay red (offline), busca en el caché
                return caches.match(event.request);
            })
    );
});