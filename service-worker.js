// The Mill Game - Service Worker v2
const CACHE_NAME = 'mill-game-v2';
const BASE_PATH = '/The-Mill-Game-online-pwa';

const ASSETS_TO_CACHE = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icon-192.png',
  BASE_PATH + '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        BASE_PATH + '/index.html',
        BASE_PATH + '/manifest.json',
        BASE_PATH + '/icon-192.png',
        BASE_PATH + '/icon-512.png',
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip Firebase
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('firebaseio') ||
      event.request.url.includes('googleapis')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match(BASE_PATH + '/index.html');
          }
        });
      })
  );
});
