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
        <div className="relative rounded-[22px] bg-white/12 border border-white/20 backdrop-blur-[20px] overflow-hidden p-8" style={{
          boxShadow: '0 20px 40px rgba(153, 27, 27, 0.25), 0 0 30px rgba(220, 38, 38, 0.15)'
        }}>
          {/* Subtle red gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/8 to-red-700/5 pointer-events-none" />

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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-300 via-red-200 to-red-300 bg-clip-text text-transparent mb-3 pr-8" style={{
              textShadow: '0 4px 12px rgba(153, 27, 27, 0.3)',
              fontFamily: 'Inter, Poppins, sans-serif',
              fontWeight: '800'
            }}>
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
                  <div className="bg-gradient-to-r from-red-600/25 to-red-500/20 border border-red-400/40 backdrop-blur-md rounded-2xl px-6 py-4 text-center">
                    <p className="text-red-100 font-semibold text-lg">
                      Offer Expired
                    </p>
                  </div>
                ) : (
                  <div className="relative bg-gradient-to-r from-red-600/20 via-red-500/15 to-emerald-500/10 border border-red-400/30 backdrop-blur-md rounded-2xl px-6 py-6 pulse-subtle" style={{
                    boxShadow: 'inset 0 1px 2px rgba(16, 185, 129, 0.2)'
                  }}>
                    {/* Top green accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent rounded-t-2xl" />
                    
                    <p className="text-red-100/80 text-sm font-medium mb-4 uppercase tracking-wider">
                      Expires in
                    </p>
                    <div className="flex justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-red-100 font-mono tracking-wider">
                          {timeLeft.hours}
                        </div>
                        <p className="text-red-100/50 text-xs uppercase mt-1 font-medium">hrs</p>
                      </div>
                      <div className="text-3xl text-red-100/40 self-start mt-2">:</div>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-red-100 font-mono tracking-wider">
                          {timeLeft.minutes}
                        </div>
                        <p className="text-red-100/50 text-xs uppercase mt-1 font-medium">min</p>
                      </div>
                      <div className="text-3xl text-red-100/40 self-start mt-2">:</div>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold text-red-100 font-mono tracking-wider">
                          {timeLeft.seconds}
                        </div>
                        <p className="text-red-100/50 text-xs uppercase mt-1 font-medium">sec</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={onClose}
              className="relative w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-base uppercase tracking-wider overflow-hidden"
              style={{
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35), inset 0 1px 2px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(220, 38, 38, 0.5), inset 0 1px 2px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.35), inset 0 1px 2px rgba(16, 185, 129, 0.3)';
              }}
            >
              <span className="relative z-10">Claim Now</span>
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

        @keyframes subtlePulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 1.02;
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pulse-subtle {
          animation: subtlePulse 5s ease-in-out infinite;
        }

        .hover\:glow-subtle:hover {
          box-shadow: 0 0 12px rgba(220, 38, 38, 0.4);
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
