const CACHE_NAME = 'esp32-mqtt-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response; // Devuelve del caché
            }
            return fetch(event.request); // Si no está, lo baja de internet
        })
    );
});