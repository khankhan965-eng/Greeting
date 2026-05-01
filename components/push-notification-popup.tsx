"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface PushNotificationPopupProps {
  onClose: () => void
}

export default function PushNotificationPopup({ onClose }: PushNotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

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

    // Show popup after 3 seconds on first visit
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleAllow = async () => {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission === "granted") {
        // Register service worker and subscribe to push notifications
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          })
          
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })

          // Send subscription to backend
          await fetch("/api/push-subscriptions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          })

          // Store decision
          localStorage.setItem("push_notification_decision", "allowed")
          localStorage.setItem("push_notification_decision_time", Date.now().toString())
        }
      } else if (permission === "denied") {
        localStorage.setItem("push_notification_decision", "denied")
        localStorage.setItem("push_notification_decision_time", Date.now().toString())
      }
    } catch (error) {
      console.error("[v0] Push notification error:", error)
    }

    setIsVisible(false)
    onClose()
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

        <div className="flex gap-3">
          <button
            onClick={handleNotNow}
            className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={handleAllow}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Allow
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          You can change this anytime in browser settings
        </p>
      </div>
    </div>
  )
}
