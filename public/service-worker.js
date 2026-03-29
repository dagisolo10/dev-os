const CACHE_NAME = "dev-os-v.1.3";
const PRE_CACHE_RESOURCES = ["/", "/icon/android-chrome-192x192.png", "/icon/android-chrome-512x512.png"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE_RESOURCES)));
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET" || !event.request.url.startsWith("http") || event.request.url.includes("chrome-extension")) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const cacheClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheClone));
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse || caches.match("/"));

            return cachedResponse || fetchPromise;
        }),
    );
});
