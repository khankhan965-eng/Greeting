"use client"

import { Leaf } from "lucide-react"

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white splash-fade">
      <div className="text-center splash-content">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="text-primary" size={48} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">RTC</h1>
        <p className="text-lg text-muted-foreground mb-1">Ratlam Tea Cafe</p>
        <p className="text-sm text-muted-foreground/70">Serving tea since 2019</p>
      </div>
    </div>
  )
}
