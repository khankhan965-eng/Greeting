"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import Header from "./header"
import ProductGrid from "./product-grid"
import Footer from "./footer"
import SplashScreen from "./splash-screen"
import OfflineIndicator from "./offline-indicator"
import WhatsAppButton from "./whatsapp-button"
import Toast from "./toast"
import type { ShopData } from "@/types"
import { getDefaultData } from "@/lib/storage"

interface PublicPageProps {
  onAdminClick: () => void
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
          // Use server status + default product data
          setData({
            ...getDefaultData(),
            status: statusData.status,
            closeMessage: statusData.closeMessage,
            isEarlyClosing: statusData.isEarlyClosing,
            earlyClosingTime: statusData.earlyClosingTime,
            earlyClosingReason: statusData.earlyClosingReason,
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

      <div className="min-h-screen flex flex-col bg-background">
        <Header shopName={data.shopName} status={data.status} onAdminClick={onAdminClick} />

        {data.isEarlyClosing && data.earlyClosingTime && data.earlyClosingReason && (
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
