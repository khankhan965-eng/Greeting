"use client"

import { useEffect, useState } from "react"
import { Lock, LogOut } from "lucide-react"
import AdminLogin from "./admin-login"
import AdminControls from "./admin-controls"
import type { ShopData } from "@/types"
import { getDefaultData } from "@/lib/storage"

interface AdminPageProps {
  isAuthenticated: boolean
  onAuthenticated: (authenticated: boolean) => void
  onLogout: () => void
}

export default function AdminPage({ isAuthenticated, onAuthenticated, onLogout }: AdminPageProps) {
  const [data, setData] = useState<ShopData | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const fetchServerStatus = async () => {
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
          })
        } else {
          setData(getDefaultData())
        }
      } catch (error) {
        console.error("[v0] Failed to fetch status:", error)
        setData(getDefaultData())
      }
    }

    fetchServerStatus()

    const checkFirstVisit = !localStorage.getItem("admin_visited")
    if (checkFirstVisit) {
      setShowInstructions(true)
      localStorage.setItem("admin_visited", "true")
    }
  }, [])

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={onAuthenticated} />
  }

  if (!data) return <div className="p-4">Loading...</div>

  const handleDataUpdate = (newData: ShopData) => {
    setData(newData)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock size={24} />
            <h1 className="text-2xl font-bold">RTC Admin Panel</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <AdminControls
        data={data}
        onDataUpdate={handleDataUpdate}
        showInstructions={showInstructions}
        onCloseInstructions={() => setShowInstructions(false)}
      />
    </div>
  )
}
