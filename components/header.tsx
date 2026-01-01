"use client"

import { Leaf } from "lucide-react"
import { useEffect, useState } from "react"

interface HeaderProps {
  shopName: string
  status: string
  onAdminClick: () => void
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good Morning ☀️"
  if (hour >= 12 && hour < 17) return "Good Afternoon 🌤️"
  return "Good Evening 🌙"
}

export default function Header({ shopName, status, onAdminClick }: HeaderProps) {
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  return (
    <header className="bg-white border-b-2 border-primary">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {greeting && (
          <div className="mb-3 text-center sm:text-left">
            <p className="text-sm sm:text-base font-medium text-muted-foreground greeting-fade-in">{greeting}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Leaf className="text-primary" size={28} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">RTC</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Ratlam Tea Cafe</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Serving tea since 2019</p>
            </div>
          </div>

          <button
            onClick={onAdminClick}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold button-hover touch-target"
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  )
}
