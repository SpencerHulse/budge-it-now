const APP_PREFIX = "BudgeItNow-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/index.js",
  "/js/idb.js",
];

self.addEventListener("install", function (event) {
  console.log(`WORKER: install event in progress.`);
  event.waitUntil(
    // Add files to the cache
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => console.log(`WORKER: install complete.`))
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
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

self.addEventListener("fetch", function (event) {
  // Code given by module/video in module but doesn't actually work offline
  // console.log("fetch request : " + e.request.url);
  /*   event.respondWith(
    caches.match(event.request).then(function (request) {
      return request || fetch(event.request);
    })
  ); */

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      let networked = fetch(event.request)
        .then(fetchedFromNetwork, unableToResolve)
        .catch(unableToResolve);
      return cached || networked;

      function fetchedFromNetwork(response) {
        let cacheCopy = response.clone();

        caches
          .open(CACHE_NAME)
          .then(function add(cache) {
            cache.put(event.request, cacheCopy);
          })
          .then(function () {
            console.log(`Fetch response stored in cache`);
          });
        return response;
      }

      function unableToResolve() {
        return new Response(`<h1>Service Unavailable</h1>`, {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "content-Type": "text/plain" }),
        });
      }
    })
  );
});

// Pseudo code given by learning helper
// set a variable for data cache name --- Don't understand this
// check to see if event.url includes "/api/" --- Done
// if it does open then use the data cache name variable to open the cache
// return fetch event.request
// if fetch.status is 200/successful
// update the cache using .clone() method
// .catch return cache.match (event.request) ------ if the code reaches the catch block it means you are offline and it will serve files from cache
