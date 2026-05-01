"use client"

import { useEffect, useState } from "react"
import Header from "./header"
import ProductGrid from "./product-grid"
import Footer from "./footer"
import SplashScreen from "./splash-screen"
import OfflineIndicator from "./offline-indicator"
import WhatsAppButton from "./whatsapp-button"
import Toast from "./toast"
import { OfferPopup } from "./offer-popup"
import PushNotificationPopup from "./push-notification-popup"
import TestNotificationButton from "./test-notification-button"
import type { ShopData, Offer } from "@/types"
import { getDefaultData } from "@/lib/storage"
import { isShopOpenToday, getNextSlotInfo, getCurrentTimeInIST, parseTimeToMinutes, getCurrentActiveSlot, getTimeUntilClosing, formatTime12Hour } from "@/lib/schedule-utils"
import { Clock, MapPin } from "lucide-react"

interface PublicPageProps {
  onAdminClick: () => void
}

interface TimeSlot {
  id: string
  day_of_week: number
  opening_time: string
  closing_time: string
  is_closed?: boolean
  is_active?: boolean
}

export default function PublicPage({ onAdminClick }: PublicPageProps) {
  const [data, setData] = useState<ShopData | null>(null)
  const [schedules, setSchedules] = useState<TimeSlot[]>([])
  const [showUnavailable, setShowUnavailable] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [visibleOffer, setVisibleOffer] = useState<Offer | null>(null)
  const [, setUpdateTrigger] = useState(0) // Force re-render every minute
  const [showPushNotificationPopup, setShowPushNotificationPopup] = useState(false)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        // First, check if there's saved data in localStorage
        const savedData = localStorage.getItem("rtc_shop_data")
        let shopData = getDefaultData()
        
        if (savedData) {
          try {
            shopData = JSON.parse(savedData)
          } catch {
            // If parsing fails, use default data
          }
        }

        const [statusResponse, scheduleResponse, offersResponse] = await Promise.all([
          fetch("/api/status"),
          fetch("/api/schedule"),
          fetch("/api/offers"),
        ])

        let statusData = { status: "open" as const, closeMessage: "" }
        let scheduleData: TimeSlot[] = []
        let offersData: Offer[] = []

        if (statusResponse.ok) {
          statusData = await statusResponse.json()
        }

        if (scheduleResponse.ok) {
          const data = await scheduleResponse.json()
          scheduleData = data.schedules || []
        }

        if (offersResponse.ok) {
          offersData = await offersResponse.json()
        }

        let finalStatus: "open" | "closed" = (statusData.status === "open" || statusData.status === "closed") ? statusData.status : "open"
        let finalMessage = statusData.closeMessage
        
        if (scheduleData.length > 0) {
          const isOpen = isShopOpenToday(scheduleData)
          if (!isOpen) {
            const nextSlot = getNextSlotInfo(scheduleData)
            finalStatus = "closed"
            finalMessage = nextSlot
              ? `Closed. Will open ${nextSlot.isToday ? "at" : "tomorrow at"} ${nextSlot.slot.opening_time}`
              : "Closed. Check schedule for opening times"
          } else {
            finalStatus = "open"
          }
        }

        setSchedules(scheduleData)
        setOffers(offersData)
        setData({
          ...shopData,
          status: finalStatus,
          closeMessage: finalMessage,
        })

        // Show first active offer
        if (offersData.length > 0) {
          const now = new Date()
          const activeOffer = offersData.find(
            (o: Offer) =>
              new Date(o.start_datetime) <= now &&
              new Date(o.end_datetime) >= now &&
              o.active
          )
          if (activeOffer) {
            setVisibleOffer(activeOffer)
          }
        }
      } catch (error) {
        console.error("[v0] Failed to fetch data:", error)
        setData(getDefaultData())
        // Ensure schedules and offers are set even if fetch fails
        setSchedules([])
      }
    }

    fetchServerData()

    const splashTimer = setTimeout(() => {
      setShowSplash(false)
    }, 1500)

    // Update UI every 1 minute for real-time timing updates
    const updateInterval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1)
    }, 60000) // 60 seconds = 1 minute

    return () => {
      clearTimeout(splashTimer)
      clearInterval(updateInterval)
    }
  }, [])

  // Initialize push notifications on first visit
  useEffect(() => {
    // Check if push notification popup has been shown before
    const hasShownNotificationPopup = localStorage.getItem("push_notification_popup_shown")
    
    if (!hasShownNotificationPopup && typeof window !== "undefined") {
      // Mark as shown to avoid showing on every page load
      localStorage.setItem("push_notification_popup_shown", "true")
      // Show popup after splash screen disappears
      const timer = setTimeout(() => {
        setShowPushNotificationPopup(true)
      }, 2000) // 2 seconds after splash (splash is 1.5s + some buffer)

      return () => clearTimeout(timer)
    }
  }, [])

  if (!data) return <div className="p-4">Loading...</div>

  const availableProducts = (data.products || []).filter((p) => p.available)
  const displayProducts = showUnavailable ? (data.products || []) : availableProducts

  const statusDisplay = {
    open: { badge: "OPEN", color: "from-green-400 to-green-600", message: "We are Open" },
    closed: { badge: "CLOSED", color: "from-red-400 to-red-600", message: "We are Closed" },
  }

  const current = statusDisplay[data.status || "open"] || statusDisplay["open"]

  // Get current active slot and time until closing (updates every minute via updateTrigger)
  const currentActiveSlot = getCurrentActiveSlot(schedules)
  const timeUntilClosing = getTimeUntilClosing(schedules)
  const nextSlotInfo = getNextSlotInfo(schedules)

  return (
    <>
      {showSplash && <SplashScreen />}

      <OfflineIndicator />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {visibleOffer && (
        <OfferPopup offer={visibleOffer} onClose={() => setVisibleOffer(null)} />
      )}

      <div className="min-h-screen flex flex-col bg-background">
        <Header shopName={data.shopName} status={data.status} onAdminClick={onAdminClick} />

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-12">
          {/* Status and Timing Cards - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {/* Shop Status Card - Compact */}
            <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-3">Shop Status</p>

              {/* Circular Status Badge - Smaller */}
              <div className="flex justify-center mb-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg bg-gradient-to-br ${current.color} ${
                    data.status === "open" ? "status-pulse status-glow-green" : "status-glow-red"
                  }`}
                >
                  {current.badge}
                </div>
              </div>

              {/* Status Message */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-0.5">{current.message}</h3>
                {data.status === "closed" && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{data.closeMessage}</p>
                )}
              </div>
            </div>

            {/* Shop Timing Card */}
            <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Shop Timing</p>
              </div>

              {currentActiveSlot ? (
                <div>
                  {/* Current Active Slot Only */}
                  <div className="mb-4">
                    <p className="text-sm font-bold text-foreground">
                      {formatTime12Hour(currentActiveSlot.opening_time)} – {formatTime12Hour(currentActiveSlot.closing_time)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Current slot</p>
                  </div>

                  {/* Status Line with Time Until Closing */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs mt-1">
                      <span className="text-green-600 font-semibold">Open</span>
                      <span className="text-gray-400">{" "}• Closes at {formatTime12Hour(currentActiveSlot.closing_time)}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {nextSlotInfo ? (
                    <>
                      <div className="mb-4">
                        <p className="text-sm font-bold text-foreground">
                          {formatTime12Hour(nextSlotInfo.slot.opening_time)} – {formatTime12Hour(nextSlotInfo.slot.closing_time)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Next slot</p>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs mt-1">
                          <span className="text-red-600 font-semibold">Closed</span>
                          <span className="text-gray-400">
                            {" "}• Opens {nextSlotInfo.isToday ? "at" : "tomorrow at"} {formatTime12Hour(nextSlotInfo.slot.opening_time)}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No schedule available</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">What We Have Today</h2>
              {(data.products || []).some((p) => !p.available) && (
                <button
                  onClick={() => setShowUnavailable(!showUnavailable)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-semibold button-hover"
                >
                  {showUnavailable ? "Show only available" : "Show only available"}
                </button>
              )}
            </div>

            {displayProducts.length > 0 ? (
              <ProductGrid products={displayProducts} showUnavailable={showUnavailable} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products available at the moment</p>
              </div>
            )}
          </div>
        </div>

        <Footer shopName={data.shopName} />

        <WhatsAppButton />

        <TestNotificationButton />

        {showPushNotificationPopup && (
          <PushNotificationPopup onClose={() => setShowPushNotificationPopup(false)} />
        )}
      </div>
    </>
  )
}
