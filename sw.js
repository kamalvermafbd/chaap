const CACHE_NAME = "chaap-cache-v12";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (response.ok && event.request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/offline.html");
          }

          if (event.request.destination === "image") {
            return new Response(
              `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                 <rect width="100%" height="100%" fill="#eee"/>
                 <text x="50%" y="50%" fill="#999" font-size="20" text-anchor="middle">
                   Offline
                 </text>
               </svg>`,
              { headers: { "Content-Type": "image/svg+xml" } }
            );
          }
        });
    })
  );
});











