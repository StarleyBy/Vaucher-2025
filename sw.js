const CACHE_NAME = 'vaucher-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.html',
  '/база.html',
  '/ишуры.html',
  '/квитанции.html',
  '/новые-группы.html',
  '/новый-ученик.html',
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/assets/js/auth.js',
  '/assets/js/google-api.js',
  '/assets/js/база.js',
  '/assets/js/ишуры.js',
  '/assets/js/квитанции.js',
  '/assets/js/новые-группы.js',
  '/assets/js/новый-ученик.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache:', error);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});