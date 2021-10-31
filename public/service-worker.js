const staticCacheName = 'pages-cache-v1';


const FILES_TO_CACHE = [
  // "/",
  // "/index.html",
  // "/assets/css/styles.css",
  // "/index.js",
  // "/idb.js",
  // "/manifest.json",
  // "/assets/icons/icon-192x192.png"
];

//https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker   great resource

self.addEventListener('install', e => {
  console.log('Attempting to install service worker and cache static assets');
  e.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  )
})



// Respond with cached resources
self.addEventListener('fetch', e => {
  console.log('Fetch event for ', e.request.url);
  e.respondWith(
    caches.match(e.request)
    .then(response => {
      if (response) {
        console.log('Found ', e.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', e.request.url);
      return fetch(e.request)

      .then(response => {
        return caches.open(staticCacheName).then(cache => {
          cache.put(e.request.url, response.clone());
          return response;
        });
      });

    }).catch(error => {

      console.log(error);

    })
  );
});



self.addEventListener('activate', e => {
  console.log('Activating new service worker...');

  const cacheAllowlist = [staticCacheName];

  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

