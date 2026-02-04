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
import { isShopOpenToday, getNextOpeningTime } from "@/lib/schedule-utils"

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
          ...getDefaultData(),
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
      }
    }

    fetchServerData()

    const splashTimer = setTimeout(() => {
      setShowSplash(false)
    }, 1500)

    return () => clearTimeout(splashTimer)
  }, [])

  if (!data) return <div className="p-4">Loading...</div>

  const availableProducts = data.products.filter((p) => p.available)
  const displayProducts = showUnavailable ? data.products : availableProducts

  const statusDisplay = {
    open: { badge: "OPEN", color: "from-green-400 to-green-600", message: "We are Open" },
    closed: { badge: "CLOSED", color: "from-red-400 to-red-600", message: "We are Closed" },
  }

  const current = statusDisplay[data.status]

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
          {/* Shop Status Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-primary/20 p-8 sm:p-12 mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Shop Status</h2>
            <p className="text-muted-foreground mb-8">Live Operating Status</p>

            {/* Large Circular Status Badge */}
            <div className="flex justify-center mb-8">
              <div
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl bg-gradient-to-br ${current.color} ${
                  data.status === "open" ? "status-pulse status-glow-green" : "status-glow-red"
                }`}
              >
                {current.badge}
              </div>
            </div>

            {/* Status Message */}
            <div>
              {data.status === "open" ? (
                <>
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">We are Open</h3>
                  <p className="text-lg text-muted-foreground">Welcome! Come enjoy our fresh tea</p>
                </>
              ) : (
                <>
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">We are Closed</h3>
                  <p className="text-lg text-muted-foreground">{data.closeMessage}</p>
                </>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">What We Have Today</h2>
              {data.products.some((p) => !p.available) && (
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
