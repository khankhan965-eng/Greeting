// Push Notifications Utilities

export interface PushSubscription {
  endpoint: string
  auth: string
  p256dh: string
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  url?: string
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
}

/**
 * Check if notification permission is granted
 */
export function isNotificationPermissionGranted(): boolean {
  if (typeof window === "undefined") return false
  return Notification.permission === "granted"
}

/**
 * Get push notification permission status
 */
export function getPushPermissionStatus(): NotificationPermission {
  if (typeof window === "undefined") return "denied"
  return Notification.permission
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationsSupported()) {
    console.warn("[v0] Push notifications not supported")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })
    console.log("[v0] Service Worker registered:", registration)
    return registration
  } catch (error) {
    console.error("[v0] Service Worker registration failed:", error)
    return null
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!isPushNotificationsSupported()) {
    console.warn("[v0] Push notifications not supported")
    return null
  }

  try {
    // Register service worker if not already registered
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await registerServiceWorker()
    }

    if (!registration) {
      throw new Error("Failed to register service worker")
    }

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription()

    // If no subscription exists, create one
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
    }

    // Convert subscription to a serializable format
    const subscriptionData: PushSubscription = {
      endpoint: subscription.endpoint,
      auth: arrayBufferToBase64(subscription.getKey("auth") as ArrayBuffer),
      p256dh: arrayBufferToBase64(subscription.getKey("p256dh") as ArrayBuffer),
    }

    console.log("[v0] Subscribed to push notifications")
    return subscriptionData
  } catch (error) {
    console.error("[v0] Failed to subscribe to push notifications:", error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationsSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      return false
    }

    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      console.log("[v0] Unsubscribed from push notifications")
      return true
    }

    return false
  } catch (error) {
    console.error("[v0] Failed to unsubscribe from push notifications:", error)
    return false
  }
}

/**
 * Check if user is currently subscribed
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
  if (!isPushNotificationsSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      return false
    }

    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    console.error("[v0] Error checking subscription status:", error)
    return false
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * Send subscription to server
 */
export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
  try {
    const response = await fetch("/api/push-subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    })

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`)
    }

    console.log("[v0] Subscription sent to server")
    return true
  } catch (error) {
    console.error("[v0] Failed to send subscription to server:", error)
    return false
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") {
    return "denied"
  }

  try {
    const permission = await Notification.requestPermission()
    console.log("[v0] Notification permission:", permission)
    return permission
  } catch (error) {
    console.error("[v0] Error requesting notification permission:", error)
    return "denied"
  }
}
