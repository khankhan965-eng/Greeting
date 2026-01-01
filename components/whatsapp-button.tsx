"use client"

import { MessageCircle } from "lucide-react"

export default function WhatsAppButton() {
  const whatsappNumber = "919999999999" // Replace with actual number
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I'd like to order from RTC.`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 whatsapp-float touch-target"
      aria-label="Order on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  )
}
