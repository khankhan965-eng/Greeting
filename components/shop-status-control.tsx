"use client"

import type React from "react"
import { useState } from "react"
import type { ShopData } from "@/types"

interface ShopStatusControlProps {
  data: ShopData
  onDataUpdate: (data: ShopData) => void
}

export default function ShopStatusControl({ data, onDataUpdate }: ShopStatusControlProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: "open" | "closed") => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          closeMessage: data.closeMessage,
        }),
      })

      if (response.ok) {
        onDataUpdate({
          ...data,
          status: newStatus,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCloseMessageChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value
    const updatedData = { ...data, closeMessage: newMessage }
    onDataUpdate(updatedData)

    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: data.status,
          closeMessage: newMessage,
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to save message:", error)
    }
  }

  const handleAutoScheduleToggle = async (enabled: boolean) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          enableAutoSchedule: enabled,
        }),
      })

      if (response.ok) {
        onDataUpdate({
          ...data,
          enableAutoSchedule: enabled,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update schedule:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTimeChange = async (field: "dailyOpenTime" | "dailyCloseTime", value: string) => {
    const updatedData = { ...data, [field]: value }
    onDataUpdate(updatedData)

    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })
    } catch (error) {
      console.error("[v0] Failed to save time:", error)
    }
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">Shop Status & Schedule</h2>

      <div className="space-y-8">
        {/* Status Buttons */}
        <div>
          <label className="block text-lg font-semibold text-foreground mb-4">
            Current Status: <span className="text-primary capitalize">{data.status.toUpperCase()}</span>
          </label>
          <p className="text-sm text-muted-foreground mb-4">Click a button to change the shop status</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusChange("open")}
              disabled={isUpdating || data.status === "open"}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                data.status === "open"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ✓ OPEN
            </button>

            <button
              onClick={() => handleStatusChange("closed")}
              disabled={isUpdating || data.status === "closed"}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                data.status === "closed"
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ✕ CLOSED
            </button>
          </div>

          {isUpdating && <p className="text-sm text-muted-foreground mt-3">Updating...</p>}
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Operating Schedule</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure when the shop automatically opens and closes each day.
          </p>

          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="enableAutoSchedule"
              checked={data.enableAutoSchedule || false}
              onChange={(e) => handleAutoScheduleToggle(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="enableAutoSchedule" className="text-sm font-semibold text-foreground">
              Enable Automatic Daily Schedule
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Default Opening Time</label>
              <input
                type="text"
                value={data.dailyOpenTime || "09:00 AM"}
                onChange={(e) => handleTimeChange("dailyOpenTime", e.target.value)}
                placeholder="e.g., 09:00 AM"
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Default Closing Time</label>
              <input
                type="text"
                value={data.dailyCloseTime || "10:00 PM"}
                onChange={(e) => handleTimeChange("dailyCloseTime", e.target.value)}
                placeholder="e.g., 10:00 PM"
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Close Message */}
        <div>
          <label htmlFor="close-message" className="block text-lg font-semibold text-foreground mb-2">
            Closed Message
          </label>
          <p className="text-sm text-muted-foreground mb-3">Message shown to customers when the shop is closed</p>
          <textarea
            id="close-message"
            value={data.closeMessage}
            onChange={handleCloseMessageChange}
            className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
