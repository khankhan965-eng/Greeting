"use client"

import { useEffect, useState } from "react"
import { X, Bell } from "lucide-react"

interface PushNotificationPopupProps {
  onClose: () => void
}

export default function PushNotificationPopup({ onClose }: PushNotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [swReady, setSwReady] = useState(false)

  useEffect(() => {
    // Check if user has already made a decision (within 30 days)
    const lastDecision = localStorage.getItem("push_notification_decision")
    const decisionTime = localStorage.getItem("push_notification_decision_time")
    
    if (lastDecision && decisionTime) {
      const daysPassed = (Date.now() - Number.parseInt(decisionTime, 10)) / (1000 * 60 * 60 * 24)
      if (daysPassed < 30) {
        onClose()
        return
      }
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .then(() => {
          console.log("[v0] Service Worker registered")
          // Wait for service worker to be ready
          return navigator.serviceWorker.ready
        })
        .then(() => {
          console.log("[v0] Service Worker is ready")
          setSwReady(true)
          
          // Show test notification immediately after SW is ready
          navigator.serviceWorker.ready.then((reg) => {
            console.log("[v0] Showing immediate test notification")
            reg.showNotification("RTC Tea Cafe", {
              body: "Test notification working!",
              icon: "/icon.png",
              tag: "test-notification",
            }).catch((error) => {
              console.log("[v0] Could not show notification:", error.message)
            })
          })
        })
        .catch((error) => {
          console.error("[v0] Service Worker registration failed:", error)
        })
    }

    // Show popup after 3 seconds on first visit
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleTestNotification = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Test notification button clicked")
      
      if (!swReady) {
        console.log("[v0] Waiting for service worker...")
        await navigator.serviceWorker.ready
        setSwReady(true)
      }

      console.log("[v0] Showing test notification from button")
      await navigator.serviceWorker.ready.then((reg) => {
        return reg.showNotification("RTC Tea Cafe", {
          body: "Test notification working!",
          icon: "/icon.png",
          tag: "test-notification",
        })
      })

      console.log("[v0] Test notification displayed successfully")
    } catch (error) {
      console.error("[v0] Error showing test notification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAllow = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] User clicked Allow")

      if ("Notification" in window) {
        const permission = await Notification.requestPermission()
        console.log("[v0] Notification permission:", permission)

        if (permission === "granted") {
          console.log("[v0] Permission granted, showing test notification")
          // Show test notification
          await handleTestNotification()
          
          localStorage.setItem("push_notification_decision", "allowed")
          localStorage.setItem("push_notification_decision_time", Date.now().toString())
        } else {
          localStorage.setItem("push_notification_decision", "denied")
          localStorage.setItem("push_notification_decision_time", Date.now().toString())
        }
      }
    } catch (error) {
      console.error("[v0] Error requesting notification permission:", error)
    } finally {
      setIsLoading(false)
      setIsVisible(false)
      onClose()
    }
  }

  const handleNotNow = () => {
    localStorage.setItem("push_notification_decision", "later")
    localStorage.setItem("push_notification_decision_time", Date.now().toString())
    setIsVisible(false)
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleNotNow}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Latest offers aur updates paane ke liye notifications allow karein
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleTestNotification}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-foreground bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Bell size={16} />
            {isLoading ? "Testing..." : "Test Notification"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleNotNow}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={handleAllow}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? "..." : "Allow"}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          You can change this anytime in browser settings
        </p>
      </div>
    </div>
  )
}
