"use client"

import { Offer } from "@/types"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface OfferPopupProps {
  offer: Offer
  onClose: () => void
}

export function OfferPopup({ offer, onClose }: OfferPopupProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string
    minutes: string
    seconds: string
    expired: boolean
  }>({ hours: "00", minutes: "00", seconds: "00", expired: false })

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
          seconds: "00",
          expired: true,
        })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        expired: false,
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [offer.show_timer, offer.end_datetime])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Subtle backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Clean card with soft colors */}
      <div className="relative max-w-md w-full animate-fadeInScale">
        <div className="relative rounded-2xl bg-white overflow-hidden p-8 shadow-lg">
          {/* Content */}
          <div className="relative z-10">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Close offer"
            >
              <X size={24} strokeWidth={2} />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3 pr-8 leading-tight">
              {offer.title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              {offer.description}
            </p>

            {/* Countdown Timer */}
            {offer.show_timer && (
              <div className="mb-8">
                {timeLeft.expired ? (
                  <div className="bg-gray-100 border border-gray-200 rounded-xl px-6 py-3 text-center">
                    <p className="text-gray-600 font-medium text-base">
                      Offer Expired
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-5">
                    <p className="text-gray-600 text-sm font-medium mb-4">
                      Limited Time Offer
                    </p>
                    <div className="flex justify-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-blue-600 font-mono">
                          {timeLeft.hours}
                        </div>
                        <p className="text-gray-500 text-xs mt-1 font-medium">hours</p>
                      </div>
                      <div className="text-2xl text-gray-400 self-start mt-1">:</div>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-blue-600 font-mono">
                          {timeLeft.minutes}
                        </div>
                        <p className="text-gray-500 text-xs mt-1 font-medium">mins</p>
                      </div>
                      <div className="text-2xl text-gray-400 self-start mt-1">:</div>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold text-blue-600 font-mono">
                          {timeLeft.seconds}
                        </div>
                        <p className="text-gray-500 text-xs mt-1 font-medium">secs</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
            >
              Get Offer
            </button>

            {/* Secondary text */}
            <p className="text-gray-400 text-xs text-center mt-4">
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
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out;
        }

        @media (max-width: 640px) {
          .animate-fadeInScale {
            animation: fadeInScale 0.25s ease-out;
          }
        }
      `}</style>
    </div>
  )
}
