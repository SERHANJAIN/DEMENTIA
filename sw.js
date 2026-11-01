/* pal service worker — v13 refreshes the demo shell while retaining push notifications. */
const CACHE_NAME = 'pal-shell-v13';
const BASE_URL = new URL('./', self.location.href);
const CORE_ASSETS = [
  BASE_URL.href,
  new URL('index.html', BASE_URL).href,
  new URL('family.html', BASE_URL).href,
  new URL('voice-config.js', BASE_URL).href,
  new URL('manifest.webmanifest', BASE_URL).href,
  new URL('icons/icon.svg', BASE_URL).href,
  new URL('icons/icon-192.png', BASE_URL).href,
  new URL('icons/icon-512.png', BASE_URL).href,
  new URL('assets/ambient-home.svg', BASE_URL).href,
  new URL('assets/ambient-moments.svg', BASE_URL).href,
  new URL('assets/ambient-chat.svg', BASE_URL).href
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // Some optional artwork paths may not exist in every deployment.
      // Cache each asset independently so one 404 cannot break SW installation.
      .then(cache => Promise.allSettled(CORE_ASSETS.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request=event.request; if(request.method!=='GET') return;
  const url=new URL(request.url); if(url.origin!==self.location.origin) return;
  if(url.pathname.endsWith('/voice-config.js')) { event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(request,copy));}return response;}).catch(()=>caches.match(request))); return; }
  if(request.mode==='navigate') { event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(request,copy));return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match(new URL('index.html',BASE_URL).href)))); return; }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(request,copy));}return response;})));
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data?.text() || 'You have a reminder.' }; }
  const title = data.title || 'Pal reminder';
  const options = {
    body: data.body || 'You have a reminder.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: data.tag || 'pal-background-reminder',
    renotify: false,
    data: { url: data.url || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.location.href).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) if ('focus' in client) { client.navigate(target); return client.focus(); }
    return self.clients.openWindow(target);
  }));
});
