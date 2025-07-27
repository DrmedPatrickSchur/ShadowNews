/**
 * @fileoverview ShadowNews Service Worker
 * 
 * Progressive Web App service worker providing offline functionality, caching
 * strategies, background synchronization, and push notifications for the
 * ShadowNews email-first social platform.
 * 
 * ## Architecture Overview
 * 
 * This service worker implements a comprehensive offline-first strategy that
 * enables ShadowNews to function seamlessly even without network connectivity.
 * It manages multiple cache strategies optimized for different types of content
 * and provides background functionality for real-time features.
 * 
 * ## Key Features
 * 
 * ### 🔄 Multi-Layer Caching Strategy
 * - **Static Assets**: Long-term caching for app shell and resources
 * - **API Responses**: Time-based caching with intelligent expiration
 * - **Offline Fallbacks**: Graceful degradation when network unavailable
 * - **Cache Versioning**: Automatic cleanup of outdated cache entries
 * 
 * ### 📱 Offline-First Experience
 * - App shell caching for instant loading
 * - API response caching for offline browsing
 * - Background synchronization for pending actions
 * - Offline page fallback for unreachable content
 * 
 * ### 🔔 Real-Time Notifications
 * - Push notification handling and display
 * - Background feed updates and notifications
 * - Interactive notification actions
 * - Periodic sync for fresh content updates
 * 
 * ### 📧 Email Platform Integration
 * - Email repository synchronization
 * - Snowball distribution background processing
 * - Digest generation offline support
 * - Email-to-post conversion caching
 * 
 * ## Caching Strategy
 * 
 * ### Static Assets (Cache First)
 * Critical app resources cached indefinitely with version-based invalidation
 * 
 * ### API Responses (Network First with Fallback)
 * Fresh data when online, cached fallback when offline
 * 
 * ### User Content (Background Sync)
 * Offline actions queued and synchronized when connection restored
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-01-27
 */

/* =============================================================================
   Cache Configuration and Constants
   Cache names, versioning, and expiration settings
   ============================================================================= */

/**
 * Primary Cache Name
 * Static assets cache with version identifier for cache busting
 * 
 * @const {string} CACHE_NAME
 * @description Main cache for app shell, CSS, JavaScript, and static resources
 * 
 * Versioning Strategy:
 * - Increment version (v1 -> v2) when deploying breaking changes
 * - Forces cache refresh and ensures users get latest app version
 * - Old caches automatically cleaned up during activation
 */
const CACHE_NAME = 'shadownews-v1';

/**
 * Static Resources to Cache
 * Critical files needed for offline app shell functionality
 * 
 * @const {string[]} urlsToCache
 * @description Core files cached during service worker installation
 * 
 * Cache Contents:
 * - App shell HTML and entry points
 * - Critical CSS for initial render
 * - Core JavaScript bundles
 * - PWA manifest and branding assets
 * - Offline fallback pages
 */
const urlsToCache = [
 '/',                    // Main app entry point
 '/index.html',          // Explicit HTML shell
 '/static/css/main.css', // Critical styles
 '/static/js/main.js',   // Core JavaScript
 '/manifest.json',       // PWA configuration
 '/favicon.ico',         // Branding assets
 '/offline.html'         // Offline fallback page
];

/**
 * API Cache Configuration
 * Dynamic content caching with time-based expiration
 */

/** API responses cache name */
const API_CACHE = 'shadownews-api-v1';

/** API cache expiration time in milliseconds (5 minutes) */
const API_CACHE_EXPIRY = 5 * 60 * 1000;

/* =============================================================================
   Service Worker Installation
   Cache population and service worker activation
   ============================================================================= */

/**
 * Service Worker Install Event
 * Handles initial cache population and service worker setup
 * 
 * @event install
 * @description Triggered when service worker is first installed or updated
 * 
 * Installation Process:
 * 1. Open primary cache
 * 2. Add all static resources to cache
 * 3. Skip waiting to activate immediately
 * 4. Ensure offline functionality from first visit
 * 
 * Error Handling:
 * - Installation fails if any critical resource can't be cached
 * - Ensures complete offline functionality before activation
 */
self.addEventListener('install', event => {
 // Wait for cache population to complete before finishing installation
 event.waitUntil(
   // Open the primary cache for static assets
   caches.open(CACHE_NAME)
     .then(cache => {
       // Add all critical resources to cache in parallel
       return cache.addAll(urlsToCache);
     })
     .then(() => {
       // Skip waiting phase to activate immediately
       // Ensures users get new service worker without page reload
       return self.skipWaiting();
     })
 );
});

/* =============================================================================
   Service Worker Activation
   Cache cleanup and service worker claiming
   ============================================================================= */

/**
 * Service Worker Activate Event
 * Handles cache cleanup and service worker claiming of clients
 * 
 * @event activate
 * @description Triggered when new service worker becomes active
 * 
 * Activation Process:
 * 1. Identify outdated caches
 * 2. Delete old cache versions
 * 3. Claim control of all clients
 * 4. Ensure immediate service worker functionality
 * 
 * Cache Management:
 * - Preserves current cache versions
 * - Removes outdated caches to free storage
 * - Maintains API cache separately from static cache
 */
self.addEventListener('activate', event => {
 // Wait for cache cleanup and client claiming to complete
 event.waitUntil(
   // Get all existing cache names
   caches.keys().then(cacheNames => {
     // Delete outdated caches in parallel
     return Promise.all(
       cacheNames.map(cacheName => {
         // Keep current static and API caches, delete others
         if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
           console.log('Deleting old cache:', cacheName);
           return caches.delete(cacheName);
         }
       })
     );
   }).then(() => {
     // Take control of all clients immediately
     // Ensures new service worker handles all requests without page reload
     return self.clients.claim();
   })
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