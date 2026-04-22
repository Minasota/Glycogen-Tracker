const CACHE = 'glycogen-v3';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always fetch index.html fresh from network — never cache it
  if (e.request.mode === 'navigate' || e.request.url.endsWith('index.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Cache first for icons/manifest
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
