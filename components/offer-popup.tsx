"use client"

import { Offer } from "@/types"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface OfferPopupProps {
  offer: Offer
  onClose: () => void
}

export function OfferPopup({ offer, onClose }: OfferPopupProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    if (!offer.show_timer) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const endTime = new Date(offer.end_datetime).getTime()
      const diff = endTime - now

      if (diff <= 0) {
        setTimeLeft("Offer Expired")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [offer.show_timer, offer.end_datetime])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-red-600 mb-2">{offer.title}</h2>
        <p className="text-gray-700 mb-4">{offer.description}</p>

        {offer.show_timer && timeLeft && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center font-semibold">
            Expires in: {timeLeft}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  )
}
