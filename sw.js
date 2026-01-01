
const CACHE_NAME = 'tauba-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&family=Lateef:wght@400;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // API сұраныстарын да кэштеуге тырысамыз (тек сәтті болғанда)
          if (event.request.url.includes('api')) {
            cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
        // Егер интернет жоқ болса және кэште жоқ болса
        return new Response('Offline content not available');
    })
  );
});
