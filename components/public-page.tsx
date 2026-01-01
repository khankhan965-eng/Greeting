"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Tag } from "lucide-react"
import Header from "./header"
import ProductGrid from "./product-grid"
import Footer from "./footer"
import SplashScreen from "./splash-screen"
import OfflineIndicator from "./offline-indicator"
import WhatsAppButton from "./whatsapp-button"
import Toast from "./toast"
import type { ShopData } from "@/types"
import { getDefaultData } from "@/lib/storage"
import { isWithinTimeRange, isPastTime } from "@/lib/time-utils"

interface PublicPageProps {
  onAdminClick: () => void
}

function getEffectiveShopStatus(data: ShopData): "open" | "closed" {
  const manualStatus = data.status // 'open' or 'closed'

  // 1. Early Closing Override (Priority 1)
  // If admin set an early closing time and that time has passed, force closed.
  if (data.isEarlyClosing && data.earlyClosingTime) {
    const pastTime = isPastTime(data.earlyClosingTime)
    console.log("[v0] Early Close Check:", {
      enabled: data.isEarlyClosing,
      time: data.earlyClosingTime,
      isPast: pastTime,
    })

    if (pastTime) {
      return "closed"
    }
  }

  // 2. Daily Auto Schedule (Priority 2)
  if (data.enableAutoSchedule && data.dailyOpenTime && data.dailyCloseTime) {
    const isInsideSchedule = isWithinTimeRange(data.dailyOpenTime, data.dailyCloseTime)

    // If we are outside schedule, the shop is CLOSED unless the admin manually toggled it OPEN
    // (Manual override usually implies intent to stay open despite schedule)
    if (!isInsideSchedule && manualStatus !== "open") {
      return "closed"
    }

    // If we are inside schedule, the shop is OPEN unless the admin manually toggled it CLOSED
    if (isInsideSchedule && manualStatus === "closed") {
      return "closed"
    }

    return isInsideSchedule ? "open" : "closed"
  }

  // 3. Fallback to Manual Status (if no auto-schedule)
  return manualStatus
}

export default function PublicPage({ onAdminClick }: PublicPageProps) {
  const [data, setData] = useState<ShopData | null>(null)
  const [showUnavailable, setShowUnavailable] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const response = await fetch("/api/status")
        if (response.ok) {
          const statusData = await response.json()
          setData({
            ...getDefaultData(),
            status: statusData.status,
            closeMessage: statusData.closeMessage,
            isEarlyClosing: statusData.isEarlyClosing,
            earlyClosingTime: statusData.earlyClosingTime,
            earlyClosingReason: statusData.earlyClosingReason,
            enableAutoSchedule: statusData.enableAutoSchedule,
            dailyOpenTime: statusData.dailyOpenTime,
            dailyCloseTime: statusData.dailyCloseTime,
            offers: statusData.offers || [],
          })
        } else {
          setData(getDefaultData())
        }
      } catch (error) {
        console.error("[v0] Failed to fetch status:", error)
        setData(getDefaultData())
      }
    }

    fetchServerData()

    const splashTimer = setTimeout(() => {
      setShowSplash(false)
    }, 1500)

    return () => clearTimeout(splashTimer)
  }, []) // Runs ONLY once on initial page load

  if (!data) return <div className="p-4">Loading...</div>

  const effectiveStatus = getEffectiveShopStatus(data)

  const showEarlyClosingBanner =
    data.isEarlyClosing && data.earlyClosingTime && data.earlyClosingReason && effectiveStatus === "open"

  const activeOffers = (data.offers || []).filter(
    (o) => o.enabled && effectiveStatus === "open" && isWithinTimeRange(o.startTime, o.endTime),
  )

  const upcomingOffers = (data.offers || []).filter(
    (o) => o.enabled && !isWithinTimeRange(o.startTime, o.endTime) && !isPastTime(o.endTime),
  )

  const availableProducts = data.products.filter((p) => p.available)
  const displayProducts = showUnavailable ? data.products : availableProducts

  const statusDisplay = {
    open: { badge: "OPEN", color: "from-green-400 to-green-600", message: "We are Open" },
    closed: { badge: "CLOSED", color: "from-red-400 to-red-600", message: "We are Closed" },
  }

  const current = statusDisplay[effectiveStatus]

  return (
    <>
      {showSplash && <SplashScreen />}

      <OfflineIndicator />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="min-h-screen flex flex-col bg-background">
        <Header shopName={data.shopName} status={effectiveStatus} onAdminClick={onAdminClick} />

        {showEarlyClosingBanner && (
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-4 py-3 shadow-md">
            <div className="max-w-6xl mx-auto flex items-start gap-3">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-lg">Early Closing Alert!</p>
                <p className="text-sm">
                  Shop will close early today at <strong>{data.earlyClosingTime}</strong> - {data.earlyClosingReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeOffers.map((offer) => (
          <div
            key={offer.id}
            className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-3 shadow-md border-b border-white/10"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Tag className="flex-shrink-0" size={20} />
                <div>
                  <p className="font-bold">{offer.title}</p>
                  <p className="text-sm opacity-90">{offer.description}</p>
                </div>
              </div>
              <div className="text-xs font-mono bg-white/20 px-2 py-1 rounded">Valid until {offer.endTime}</div>
            </div>
          </div>
        ))}

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
                  effectiveStatus === "open" ? "status-pulse status-glow-green" : "status-glow-red"
                }`}
              >
                {current.badge}
              </div>
            </div>

            {/* Status Message */}
            <div>
              {effectiveStatus === "open" ? (
                <>
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">We are Open</h3>
                  <p className="text-lg text-muted-foreground">Welcome! Come enjoy our fresh tea</p>
                </>
              ) : (
                <>
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">We are Closed</h3>
                  <p className="text-lg text-muted-foreground">{data.closeMessage}</p>
                  {data.enableAutoSchedule && data.dailyOpenTime && (
                    <p className="mt-4 text-sm font-semibold text-primary">
                      We'll open tomorrow at {data.dailyOpenTime}
                    </p>
                  )}

                  {upcomingOffers.length > 0 && (
                    <div className="mt-8 p-4 bg-accent/5 rounded-xl border border-accent/10">
                      <p className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Upcoming Offers</p>
                      {upcomingOffers.map((offer) => (
                        <div key={offer.id} className="text-sm">
                          <span className="font-semibold">{offer.title}</span> starts at {offer.startTime}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className={effectiveStatus === "closed" ? "opacity-50 pointer-events-none grayscale" : ""}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">What We Have Today</h2>
              {data.products.some((p) => !p.available) && (
                <button
                  onClick={() => setShowUnavailable(!showUnavailable)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-semibold button-hover"
                >
                  {showUnavailable ? "Show all products" : "Show only available"}
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

        {effectiveStatus === "open" && <WhatsAppButton />}
      </div>
    </>
  )
}
