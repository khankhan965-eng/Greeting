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
import type { ShopData, Offer } from "@/types"
import { getDefaultData } from "@/lib/storage"
import { isShopOpenToday, getNextOpeningTime, getCurrentTimeInIST, parseTimeToMinutes } from "@/lib/schedule-utils"
import { Clock, MapPin } from "lucide-react"

interface PublicPageProps {
  onAdminClick: () => void
}

interface TimeSlot {
  id: string
  day_of_week: number
  opening_time: string
  closing_time: string
  is_active: boolean
}

export default function PublicPage({ onAdminClick }: PublicPageProps) {
  const [data, setData] = useState<ShopData | null>(null)
  const [schedules, setSchedules] = useState<TimeSlot[]>([])
  const [showUnavailable, setShowUnavailable] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [visibleOffer, setVisibleOffer] = useState<Offer | null>(null)

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

        let statusData = { status: "open", closeMessage: "" }
        let scheduleData = []
        let offersData = []

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

        let finalStatus = statusData.status
        if (scheduleData.length > 0) {
          const isOpen = isShopOpenToday(scheduleData)
          if (!isOpen) {
            const nextOpening = getNextOpeningTime(scheduleData)
            finalStatus = "closed"
            statusData.closeMessage = nextOpening
              ? `Closed. Will open at ${nextOpening}`
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
          closeMessage: statusData.closeMessage,
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

    return () => clearTimeout(splashTimer)
  }, [])

  if (!data) return <div className="p-4">Loading...</div>

  const availableProducts = (data.products || []).filter((p) => p.available)
  const displayProducts = showUnavailable ? (data.products || []) : availableProducts

  const statusDisplay = {
    open: { badge: "OPEN", color: "from-green-400 to-green-600", message: "We are Open" },
    closed: { badge: "CLOSED", color: "from-red-400 to-red-600", message: "We are Closed" },
  }

  const current = statusDisplay[data.status || "open"] || statusDisplay["open"]

  // Calculate time until closing
  const getTimeUntilClosing = () => {
    if (!schedules || schedules.length === 0) return null
    
    const today = new Date().getDay()
    const todaySchedule = schedules.find(s => s.day_of_week === today && s.is_active)
    
    if (!todaySchedule) return null
    
    const currentMinutes = getCurrentTimeInIST()
    const closingMinutes = parseTimeToMinutes(todaySchedule.closing_time)
    const minutesLeft = closingMinutes - currentMinutes
    
    if (minutesLeft <= 0) return null
    
    const hours = Math.floor(minutesLeft / 60)
    const minutes = minutesLeft % 60
    
    return { hours, minutes }
  }

  // Get opening and closing times for today
  const getTodayTiming = () => {
    if (!schedules || schedules.length === 0) return null
    
    const today = new Date().getDay()
    const todaySchedule = schedules.find(s => s.day_of_week === today && s.is_active)
    
    return todaySchedule || null
  }

  const timeUntilClosing = getTimeUntilClosing()
  const todayTiming = getTodayTiming()

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Shop Status Card - Compact */}
            <div className="bg-white rounded-xl shadow-md border border-primary/20 p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Shop Status</p>

              {/* Circular Status Badge - Smaller */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg bg-gradient-to-br ${current.color} ${
                    data.status === "open" ? "status-pulse status-glow-green" : "status-glow-red"
                  }`}
                >
                  {current.badge}
                </div>
              </div>

              {/* Status Message */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{current.message}</h3>
                {data.status === "closed" && (
                  <p className="text-xs text-muted-foreground">{data.closeMessage}</p>
                )}
              </div>
            </div>

            {/* Shop Timing Card */}
            <div className="bg-white rounded-xl shadow-md border border-primary/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-primary" />
                <p className="text-sm font-semibold text-muted-foreground">Shop Timing</p>
              </div>

              {todayTiming ? (
                <div>
                  {/* Opening and Closing Times */}
                  <div className="mb-6">
                    <p className="text-2xl font-bold text-foreground">
                      {todayTiming.opening_time} – {todayTiming.closing_time}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Today&apos;s hours</p>
                  </div>

                  {/* Status Line with Time Until Closing */}
                  {data.status === "open" && timeUntilClosing ? (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-green-600 font-semibold">
                        Open • Closes in {timeUntilClosing.hours}h {timeUntilClosing.minutes}m
                      </p>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-red-600 font-semibold">
                        Closed
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">No schedule available</p>
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
      </div>
    </>
  )
}
