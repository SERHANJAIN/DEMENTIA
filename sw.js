/* WithYou offline shell. Map tiles and external walking directions need an internet connection. */
const CACHE_NAME = 'withyou-shell-v1';
const BASE_URL = new URL('./', self.location.href);
const CORE_ASSETS = [
  BASE_URL.href,
  new URL('index.html', BASE_URL).href,
  new URL('manifest.webmanifest', BASE_URL).href,
  new URL('icons/icon.svg', BASE_URL).href,
  new URL('icons/icon-192.png', BASE_URL).href,
  new URL('icons/icon-512.png', BASE_URL).href
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match(new URL('index.html', BASE_URL).href))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  })));
});
