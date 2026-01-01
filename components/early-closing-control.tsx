"use client"
import { useState } from "react"
import { Clock, AlertCircle } from "lucide-react"
import type { ShopData } from "@/types"

interface EarlyClosingControlProps {
  data: ShopData
  onDataUpdate: (data: ShopData) => void
}

export default function EarlyClosingControl({ data, onDataUpdate }: EarlyClosingControlProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [closingTime, setClosingTime] = useState(data.earlyClosingTime || "")
  const [closingReason, setClosingReason] = useState(data.earlyClosingReason || "")

  const handleToggleEarlyClosing = async (enabled: boolean) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: data.status,
          closeMessage: data.closeMessage,
          isEarlyClosing: enabled,
          earlyClosingTime: enabled ? closingTime : null,
          earlyClosingReason: enabled ? closingReason : null,
        }),
      })

      if (response.ok) {
        onDataUpdate({
          ...data,
          isEarlyClosing: enabled,
          earlyClosingTime: enabled ? closingTime : undefined,
          earlyClosingReason: enabled ? closingReason : undefined,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update early closing:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveDetails = async () => {
    if (!closingTime || !closingReason) {
      alert("Please enter both closing time and reason")
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: data.status,
          closeMessage: data.closeMessage,
          isEarlyClosing: data.isEarlyClosing,
          earlyClosingTime: closingTime,
          earlyClosingReason: closingReason,
        }),
      })

      if (response.ok) {
        onDataUpdate({
          ...data,
          earlyClosingTime: closingTime,
          earlyClosingReason: closingReason,
        })
        alert("Early closing details updated!")
      }
    } catch (error) {
      console.error("[v0] Failed to save early closing details:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-primary" size={24} />
        <h2 className="text-2xl font-bold text-foreground">Early Closing Alert</h2>
      </div>

      <div className="space-y-6">
        {/* Toggle Early Closing */}
        <div>
          <label className="block text-lg font-semibold text-foreground mb-3">Enable Early Closing Alert</label>
          <p className="text-sm text-muted-foreground mb-4">
            Display a special alert to customers about early closing today
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleToggleEarlyClosing(true)}
              disabled={isUpdating || data.isEarlyClosing}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                data.isEarlyClosing
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ⚠ Enable Alert
            </button>

            <button
              onClick={() => handleToggleEarlyClosing(false)}
              disabled={isUpdating || !data.isEarlyClosing}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !data.isEarlyClosing
                  ? "bg-gray-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ✓ Disable Alert
            </button>
          </div>
        </div>

        {/* Early Closing Details */}
        <div
          className={`space-y-4 p-4 rounded-lg ${data.isEarlyClosing ? "bg-orange-50 border border-orange-200" : "bg-muted"}`}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className={data.isEarlyClosing ? "text-orange-600" : "text-muted-foreground"} size={20} />
            <p className="text-sm text-muted-foreground">
              {data.isEarlyClosing
                ? "Early closing alert is active and visible to customers"
                : "Configure early closing details below"}
            </p>
          </div>

          <div>
            <label htmlFor="closing-time" className="block text-sm font-semibold text-foreground mb-2">
              Closing Time
            </label>
            <input
              id="closing-time"
              type="text"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              placeholder="e.g., 8:00 PM"
              className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="closing-reason" className="block text-sm font-semibold text-foreground mb-2">
              Reason
            </label>
            <textarea
              id="closing-reason"
              value={closingReason}
              onChange={(e) => setClosingReason(e.target.value)}
              placeholder="e.g., Personal emergency, Family function, etc."
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleSaveDetails}
            disabled={isUpdating || !closingTime || !closingReason}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Save Details"}
          </button>
        </div>
      </div>
    </div>
  )
}
