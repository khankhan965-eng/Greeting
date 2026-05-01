"use client"

import { useState } from "react"

export default function TestNotificationButton() {
  const [isLoading, setIsLoading] = useState(false)

  const testNotification = async () => {
    console.log("[v0] Test button clicked")
    setIsLoading(true)

    try {
      // Check if Notification API is supported
      if (!("Notification" in window)) {
        alert("Notifications not supported by your browser")
        setIsLoading(false)
        return
      }

      // Request permission if not granted
      if (Notification.permission !== "granted") {
        console.log("[v0] Requesting notification permission")
        const permission = await Notification.requestPermission()
        console.log("[v0] Permission:", permission)
      }

      // Show notification if permission granted
      if (Notification.permission === "granted") {
        console.log("[v0] Permission granted, showing notification")
        const reg = await navigator.serviceWorker.ready
        
        reg.showNotification("RTC Tea Cafe", {
          body: "Test working",
          icon: "/icon.png",
        })

        console.log("[v0] Notification sent")
      } else {
        alert("Notification permission denied")
      }
    } catch (error) {
      console.error("[v0] Notification error:", error)
      alert("Error showing notification")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={testNotification}
      disabled={isLoading}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
    >
      {isLoading ? "Testing..." : "Test Notification"}
    </button>
  )
}
