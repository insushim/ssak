// Service Worker placeholder
// This file exists to prevent 404 errors when the browser looks for a service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
