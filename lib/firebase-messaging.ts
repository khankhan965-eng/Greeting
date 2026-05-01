import { firebaseConfig, isFirebaseConfigured } from "./firebase-config"

// Type definitions for Firebase (will be properly imported when firebase is installed)
type Messaging = any
type FirebaseApp = any

let messaging: Messaging | null = null
let firebaseInitialized = false

/**
 * Initialize Firebase and Messaging service
 */
export function initializeFirebaseMessaging(): Messaging | null {
  if (!isFirebaseConfigured()) {
    console.warn("[v0] Firebase config not set - push notifications disabled")
    return null
  }

  if (firebaseInitialized) {
    return messaging
  }

  try {
    // Dynamically import Firebase only when needed
    const { initializeApp } = require("firebase/app")
    const { getMessaging } = require("firebase/messaging")

    const app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
    firebaseInitialized = true
    
    console.log("[v0] Firebase Messaging initialized")
    return messaging
  } catch (error) {
    console.error("[v0] Firebase Messaging initialization failed:", error)
    console.warn("[v0] Make sure to install firebase: npm install firebase")
    return null
  }
}

/**
 * Get Firebase Cloud Messaging token for this device
 */
export async function getFCMToken(): Promise<string | null> {
  if (!messaging) {
    console.warn("[v0] Firebase Messaging not initialized")
    return null
  }

  try {
    // Check if notifications are supported and permission is granted
    if (Notification.permission !== "granted") {
      console.log("[v0] Notification permission not granted")
      return null
    }

    // Register service worker first
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        console.log("[v0] Service Worker registered for FCM")
      } catch (error) {
        console.error("[v0] Service Worker registration failed:", error)
        return null
      }
    }

    // Get FCM token
    const { getToken } = require("firebase/messaging")
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    console.log("[v0] FCM token obtained:", token)
    return token
  } catch (error) {
    console.error("[v0] Failed to get FCM token:", error)
    return null
  }
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    console.log("[v0] Requesting notification permission...")

    // Request permission
    const permission = await Notification.requestPermission()
    console.log("[v0] Notification permission:", permission)

    if (permission === "granted") {
      // Get FCM token after permission is granted
      return await getFCMToken()
    }

    return null
  } catch (error) {
    console.error("[v0] Failed to request notification permission:", error)
    return null
  }
}

/**
 * Subscribe to incoming FCM messages
 */
export function subscribeToMessages(callback: (payload: Record<string, any>) => void): void {
  if (!messaging) {
    console.warn("[v0] Firebase Messaging not initialized")
    return
  }

  try {
    const { onMessage } = require("firebase/messaging")
    onMessage(messaging, (payload: Record<string, any>) => {
      console.log("[v0] Message received:", payload)
      callback(payload)
    })
  } catch (error) {
    console.error("[v0] Error subscribing to messages:", error)
  }
}

/**
 * Save FCM token to backend database
 */
export async function saveFCMTokenToBackend(token: string, userEmail?: string): Promise<boolean> {
  try {
    console.log("[v0] Saving FCM token to backend...")

    const response = await fetch("/api/fcm-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        userEmail: userEmail || "anonymous",
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    })

    if (response.ok) {
      console.log("[v0] FCM token saved successfully")
      return true
    } else {
      console.error("[v0] Failed to save FCM token:", response.statusText)
      return false
    }
  } catch (error) {
    console.error("[v0] Error saving FCM token:", error)
    return false
  }
}
