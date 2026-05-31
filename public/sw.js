// sw.js currently does 3 things:

// 1. Install cache
// 2. Intercept requests
// 3. Serve cached/offline data

const CACHE_NAME = "dashboard-cache-v1";

const APP_SHELL = ["/", "/dashboard"]; //Cache homepage,Cache dashboard page
// This runs:ONLY ONCE when service worker installs
self.addEventListener("install", (event) => {
	event.waitUntil(
		//creates browser cache storage.
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
	);

	self.skipWaiting();
});
self.addEventListener("activate", (event) => {
	//new service worker becomes active
	event.waitUntil(
		//gets old caches.
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME) //finds outdated cache versions.
					.map((key) => caches.delete(key)), //removes old caches.
			),
		),
	);

	self.clients.claim();
});
self.addEventListener("fetch", (event) => {
	//EVERY network request
	const { request } = event;

	if (request.method !== "GET") return;

	if (request.url.includes("/api/graphql")) {
		//GraphQL requests handled specially, Because:GraphQL data changes often So you use:networkFirst()Strategy:Try server first If offline → use cache
		event.respondWith(networkFirst(request));
		return;
	}

	event.respondWith(cacheFirst(request));
});
//You want:Fresh data when online Cached data when offline Perfect for GraphQL dashboards.
async function cacheFirst(request) {
	const cached = await caches.match(request);

	if (cached) return cached;

	const response = await fetch(request);

	const cache = await caches.open(CACHE_NAME);
	cache.put(request, response.clone());

	return response;
}
async function networkFirst(request) {
	const cache = await caches.open(CACHE_NAME);

	try {
		const response = await fetch(request);
		cache.put(request, response.clone());
		return response;
	} catch {
		const cached = await cache.match(request);
		return cached || new Response("Offline", { status: 503 });
	}
}
