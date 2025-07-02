const CACHE_NAME = 'shadownews-v1';
const urlsToCache = [
 '/',
 '/index.html',
 '/static/css/main.css',
 '/static/js/main.js',
 '/manifest.json',
 '/favicon.ico',
 '/offline.html'
];

const API_CACHE = 'shadownews-api-v1';
const API_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

self.addEventListener('install', event => {
 event.waitUntil(
   caches.open(CACHE_NAME)
     .then(cache => cache.addAll(urlsToCache))
     .then(() => self.skipWaiting())
 );
});

self.addEventListener('activate', event => {
 event.waitUntil(
   caches.keys().then(cacheNames => {
     return Promise.all(
       cacheNames.map(cacheName => {
         if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
           return caches.delete(cacheName);
         }
       })
     );
   }).then(() => self.clients.claim())
 );
});

self.addEventListener('fetch', event => {
 const { request } = event;
 const url = new URL(request.url);

 // Handle API requests
 if (url.pathname.startsWith('/api/')) {
   event.respondWith(handleApiRequest(request));
   return;
 }

 // Handle static assets
 if (request.method === 'GET') {
   event.respondWith(
     caches.match(request)
       .then(response => {
         if (response) {
           return response;
         }

         return fetch(request).then(response => {
           if (!response || response.status !== 200 || response.type !== 'basic') {
             return response;
           }

           const responseToCache = response.clone();
           caches.open(CACHE_NAME)
             .then(cache => {
               cache.put(request, responseToCache);
             });

           return response;
         });
       })
       .catch(() => {
         if (request.destination === 'document') {
           return caches.match('/offline.html');
         }
       })
   );
 }
});

async function handleApiRequest(request) {
 const cache = await caches.open(API_CACHE);
 const cachedResponse = await cache.match(request);

 if (cachedResponse) {
   const cachedData = await cachedResponse.json();
   const cacheTime = new Date(cachedData.cacheTime).getTime();
   const now = new Date().getTime();

   if (now - cacheTime < API_CACHE_EXPIRY) {
     return new Response(JSON.stringify(cachedData.data), {
       headers: { 'Content-Type': 'application/json' }
     });
   }
 }

 try {
   const networkResponse = await fetch(request);
   const responseData = await networkResponse.clone().json();

   if (networkResponse.ok) {
     const cacheData = {
       data: responseData,
       cacheTime: new Date().toISOString()
     };

     const cacheResponse = new Response(JSON.stringify(cacheData), {
       headers: { 'Content-Type': 'application/json' }
     });

     await cache.put(request, cacheResponse);

     return new Response(JSON.stringify(responseData), {
       headers: { 'Content-Type': 'application/json' }
     });
   }

   return networkResponse;
 } catch (error) {
   if (cachedResponse) {
     const cachedData = await cachedResponse.json();
     return new Response(JSON.stringify(cachedData.data), {
       headers: { 'Content-Type': 'application/json' }
     });
   }

   return new Response(JSON.stringify({ error: 'Network error' }), {
     status: 503,
     headers: { 'Content-Type': 'application/json' }
   });
 }
}

// Background sync for posts
self.addEventListener('sync', event => {
 if (event.tag === 'sync-posts') {
   event.waitUntil(syncPosts());
 }
});

async function syncPosts() {
 const cache = await caches.open('shadownews-pending');
 const requests = await cache.keys();

 for (const request of requests) {
   try {
     const response = await fetch(request);
     if (response.ok) {
       await cache.delete(request);
     }
   } catch (error) {
     console.error('Sync failed for', request.url);
   }
 }
}

// Push notifications
self.addEventListener('push', event => {
 if (event.data) {
   const data = event.data.json();
   const options = {
     body: data.body,
     icon: '/favicon-192x192.png',
     badge: '/badge-72x72.png',
     vibrate: [100, 50, 100],
     data: {
       dateOfArrival: Date.now(),
       primaryKey: data.id,
       url: data.url || '/'
     },
     actions: [
       {
         action: 'view',
         title: 'View',
         icon: '/icons/view.png'
       },
       {
         action: 'close',
         title: 'Close',
         icon: '/icons/close.png'
       }
     ]
   };

   event.waitUntil(
     self.registration.showNotification(data.title || 'Shadownews', options)
   );
 }
});

self.addEventListener('notificationclick', event => {
 event.notification.close();

 if (event.action === 'view' || !event.action) {
   event.waitUntil(
     clients.openWindow(event.notification.data.url || '/')
   );
 }
});

// Periodic background sync
self.addEventListener('periodicsync', event => {
 if (event.tag === 'update-feed') {
   event.waitUntil(updateFeed());
 }
});

async function updateFeed() {
 try {
   const response = await fetch('/api/posts/feed');
   const data = await response.json();
   
   const cache = await caches.open(API_CACHE);
   await cache.put('/api/posts/feed', new Response(JSON.stringify({
     data,
     cacheTime: new Date().toISOString()
   })));

   // Check for new posts and notify
   const lastCheck = await getLastCheckTime();
   const newPosts = data.posts.filter(post => 
     new Date(post.createdAt) > new Date(lastCheck)
   );

   if (newPosts.length > 0) {
     self.registration.showNotification('New posts on Shadownews', {
       body: `${newPosts.length} new posts in your feed`,
       icon: '/favicon-192x192.png',
       badge: '/badge-72x72.png',
       tag: 'new-posts',
       renotify: true
     });
   }

   await setLastCheckTime(new Date().toISOString());
 } catch (error) {
   console.error('Feed update failed:', error);
 }
}

async function getLastCheckTime() {
 const cache = await caches.open('shadownews-meta');
 const response = await cache.match('last-check');
 if (response) {
   const data = await response.json();
   return data.time;
 }
 return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

async function setLastCheckTime(time) {
 const cache = await caches.open('shadownews-meta');
 await cache.put('last-check', new Response(JSON.stringify({ time })));
}

// Message handling
self.addEventListener('message', event => {
 if (event.data && event.data.type === 'SKIP_WAITING') {
   self.skipWaiting();
 }

 if (event.data && event.data.type === 'CACHE_URLS') {
   event.waitUntil(
     caches.open(CACHE_NAME)
       .then(cache => cache.addAll(event.data.urls))
   );
 }

 if (event.data && event.data.type === 'CLEAR_CACHE') {
   event.waitUntil(
     caches.keys().then(cacheNames => {
       return Promise.all(
         cacheNames.map(cacheName => caches.delete(cacheName))
       );
     })
   );
 }
});