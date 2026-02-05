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
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[10px]"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Glass morphism card */}
      <div className="relative max-w-md w-full animate-fadeInScale">
        <div className="relative rounded-[20px] bg-white/15 border border-white/20 backdrop-blur-[20px] shadow-2xl overflow-hidden p-8">
          {/* Subtle gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all duration-300 hover:glow-subtle text-white/70 hover:text-white"
              aria-label="Close offer"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* Title */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3 pr-8">
              {offer.title}
            </h2>

            {/* Description */}
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {offer.description}
            </p>

            {/* Countdown Timer */}
            {offer.show_timer && (
              <div className="mb-8">
                {timeLeft.expired ? (
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 backdrop-blur-md rounded-2xl px-6 py-4 text-center">
                    <p className="text-red-200 font-semibold text-lg">
                      Offer Expired
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 backdrop-blur-md rounded-2xl px-6 py-6">
                    <p className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">
                      Expires in
                    </p>
                    <div className="flex justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-white/90 font-mono tracking-wider">
                          {timeLeft.hours}
                        </div>
                        <p className="text-white/50 text-xs uppercase mt-1">hrs</p>
                      </div>
                      <div className="text-3xl text-white/40 self-start mt-2">:</div>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-white/90 font-mono tracking-wider">
                          {timeLeft.minutes}
                        </div>
                        <p className="text-white/50 text-xs uppercase mt-1">min</p>
                      </div>
                      <div className="text-3xl text-white/40 self-start mt-2">:</div>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-white/90 font-mono tracking-wider">
                          {timeLeft.seconds}
                        </div>
                        <p className="text-white/50 text-xs uppercase mt-1">sec</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:glow-gradient text-base uppercase tracking-wider"
            >
              Claim Now
            </button>

            {/* Secondary action text */}
            <p className="text-white/40 text-xs text-center mt-4">
              Don't miss out on this limited-time offer
            </p>
          </div>
        </div>
      </div>

      {/* Animation styles injected via style tag */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hover\:glow-subtle:hover {
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
        }

        .hover\:glow-gradient:hover {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.5),
            0 0 40px rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 640px) {
          .animate-fadeInScale {
            animation: fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
      `}</style>
    </div>
  )
}
