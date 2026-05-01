// Service Worker for Push Notifications
const CACHE_NAME = "rtc-cafe-v1"
const STATIC_ASSETS = [
  "/",
  "/icon.svg",
  "/icon-light-32x32.png",
  "/icon-dark-32x32.png",
  "/apple-icon.png",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[v0] Service Worker installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets might not exist, that's okay
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
  console.log("[v0] Service Worker installed")
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[v0] Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
  console.log("[v0] Service Worker activated")
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[v0] Push notification received:", event)

  let notificationData = {
    title: "RTC Cafe - New Update!",
    body: "Check out our latest offers",
    icon: "/icon.svg",
    badge: "/icon-light-32x32.png",
    tag: "rtc-notification",
    requireInteraction: false,
  }

  if (event.data) {
    try {
      const jsonData = event.data.json()
      console.log("[v0] Push data parsed:", jsonData)
      notificationData = {
        ...notificationData,
        ...jsonData,
      }
    } catch (e) {
      const textData = event.data.text()
      console.log("[v0] Push data (text):", textData)
      notificationData.body = textData
    }
  }

  console.log("[v0] Showing notification with data:", notificationData)

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: {
        url: notificationData.url || "/",
      },
    }).catch((error) => {
      console.error("[v0] Error showing notification:", error)
    })
  )
})

// Notification click event - handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[v0] Notification clicked:", event)
  event.notification.close()

  const url = event.notification.data?.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      console.log("[v0] Matched clients:", clientList.length)
      // Check if window is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && "focus" in client) {
          console.log("[v0] Focusing existing client")
          return client.focus()
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        console.log("[v0] Opening new window with URL:", url)
        return clients.openWindow(url)
      }
    }).catch((error) => {
      console.error("[v0] Error handling notification click:", error)
    })
  )
})

// Background sync for subscription updates (optional)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-subscriptions") {
    event.waitUntil(
      fetch("/api/push-subscriptions/sync").then((response) => {
        if (!response.ok) {
          throw new Error("Subscription sync failed")
        }
      })
    )
  }
})
