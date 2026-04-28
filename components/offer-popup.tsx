"use client"

import { Offer } from "@/types"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { CTAButton } from "./cta-button"

interface OfferPopupProps {
  offer: Offer
  onClose: () => void
}

export function OfferPopup({ offer, onClose }: OfferPopupProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string
    minutes: string
    expired: boolean
  }>({ hours: "00", minutes: "00", expired: false })

  useEffect(() => {
    if (!offer.show_timer) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const endTime = new Date(offer.end_datetime).getTime()
      const diff = endTime - now

      if (diff <= 0) {
        setTimeLeft({
          hours: "00",
          minutes: "00",
          expired: true,
        })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        expired: false,
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [offer.show_timer, offer.end_datetime])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed background */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Modal card with light red theme */}
      <div className="relative max-w-md w-full animate-fadeInScale">
        <div 
          className="relative overflow-hidden p-8 shadow-lg border-0"
          style={{
            borderRadius: "16px",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 transition-colors duration-200 z-10"
            style={{
              color: "#E8524F",
              backgroundColor: "#FFF0F0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFE0E0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFF0F0")}
            aria-label="Close offer"
          >
            <X size={24} strokeWidth={2} />
          </button>

          {/* Content */}
          <div className="relative z-10">
            {/* Main Title */}
            <h2 
              className="text-3xl font-bold mb-3 pr-8 leading-tight text-center"
              style={{ color: "#333333" }}
            >
              {offer.title}
            </h2>

            {/* Subtext */}
            <p 
              className="text-center text-base mb-6 font-medium"
              style={{ color: "#666666" }}
            >
              {offer.description}
            </p>

            {/* Timer Section */}
            {offer.show_timer && (
              <div className="mb-8">
                {timeLeft.expired ? (
                  <div 
                    className="rounded-2xl px-6 py-4 text-center border-2 border-solid"
                    style={{
                      backgroundColor: "#FFF0F0",
                      borderColor: "#FFB3B3",
                    }}
                  >
                    <p className="font-medium text-base" style={{ color: "#E8524F" }}>
                      Offer Expired
                    </p>
                  </div>
                ) : (
                  <div 
                    className="rounded-2xl px-6 py-5 text-center"
                    style={{ backgroundColor: "#FFF0F0" }}
                  >
                    <p 
                      className="text-sm font-medium mb-3"
                      style={{ color: "#333333" }}
                    >
                      ⏰ Sirf 2 din ke liye
                    </p>
                    <div className="flex justify-center items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div 
                          className="text-2xl font-bold font-mono"
                          style={{ color: "#FF6B6B" }}
                        >
                          {timeLeft.hours}
                        </div>
                        <p 
                          className="text-xs mt-1 font-medium"
                          style={{ color: "#666666" }}
                        >
                          hrs
                        </p>
                      </div>
                      <div 
                        className="text-xl font-bold"
                        style={{ color: "#FF6B6B" }}
                      >
                        :
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className="text-2xl font-bold font-mono"
                          style={{ color: "#FF6B6B" }}
                        >
                          {timeLeft.minutes}
                        </div>
                        <p 
                          className="text-xs mt-1 font-medium"
                          style={{ color: "#666666" }}
                        >
                          min
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <CTAButton onClick={onClose} text="Get Offer" />

            {/* Footer text */}
            <p 
              className="text-xs text-center mt-4 font-medium"
              style={{ color: "#999999" }}
            >
              Valid for limited time only
            </p>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @media (max-width: 640px) {
          .animate-fadeInScale {
            animation: fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        }
      `}</style>
    </div>
  )
}
