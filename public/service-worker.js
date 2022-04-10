const APP_PREFIX = "BudgeItNow-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/index.js",
  "./js/idb.js",
];

// Cache resources by self referring to the service worker object
self.addEventListener("install", function (e) {
  e.waitUntil(
    // Add files to the cache
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`Installing cache : ${CACHE_NAME}`);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Clear outdated caches
self.addEventListener("activate", function (e) {
  e.waitUntil(
    // Gets the keys in cache and filters it for this apps keys
    caches.keys().then((keyList) => {
      let cacheKeepList = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });

      // Push the new files to the cacheKeepList
      cacheKeepList.push(CACHE_NAME);

      // Promise that only resolves when old version of the cache is deleted
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeepList.indexOf(key) === -1) {
            console.log(`Deleting cache : ${keyList[i]}`);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

// Retrieves information from the cache
self.addEventListener("fetch", function (e) {
  // console.log(`Fetch request : ${e.request.url}`);
  e.respondWith(
    caches
      .match(e.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(e.request).then(function (response) {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(e.request, response);
            });
            return response.clone();
          });
        }
      })
      .catch(function (err) {
        console.log(err);
      })
  );
  /*   e.respondWith(
    // Checks for a match with the request
    caches.match(e.request).then((request) => {
      // console.log(request);
      // Returns the request if already cached or fetches it if not
      return request || fetch(e.request);
    })
  ); */
});
