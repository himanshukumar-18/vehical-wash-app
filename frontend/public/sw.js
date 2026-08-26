const CACHE_NAME = "blackwash-static-v1";
const OFFLINE_CACHE_NAME = "blackwash-offline-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.ico"
];

// Install Event — precache offline fallback shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — smart network-first for navigation, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. ALWAYS BYPASS: Non-GET requests, API requests, Admin routes, Razorpay payment scripts
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.hostname.includes("razorpay.com") ||
    url.hostname.includes("cloudinary.com")
  ) {
    return; // Allow normal browser network request
  }

  // 2. Navigation Mode (HTML Pages) — Network First with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE_NAME);
        const cachedOfflinePage = await cache.match(OFFLINE_URL);
        return cachedOfflinePage || Response.error();
      })
    );
    return;
  }

  // 3. Static Next.js Chunks & Local Public Assets — Cache First, Network Fallback
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
  }
});
