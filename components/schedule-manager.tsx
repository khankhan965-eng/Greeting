"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface TimeSlot {
  id: string
  day_of_week: number
  opening_time: string
  closing_time: string
  is_active: boolean
}

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [newSlot, setNewSlot] = useState({
    day_of_week: 0,
    opening_time: "09:00",
    closing_time: "22:00",
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedule")
      const data = await response.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error("Error fetching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlot = async () => {
    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          data: newSlot,
        }),
      })

      if (response.ok) {
        fetchSchedules()
        setNewSlot({ day_of_week: 0, opening_time: "09:00", closing_time: "22:00" })
      }
    } catch (error) {
      console.error("Error adding slot:", error)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          data: { id },
        }),
      })

      if (response.ok) {
        fetchSchedules()
      }
    } catch (error) {
      console.error("Error deleting slot:", error)
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          data: { id, is_active: !isActive },
        }),
      })

      if (response.ok) {
        fetchSchedules()
      }
    } catch (error) {
      console.error("Error toggling slot:", error)
    }
  }

  if (loading) return <div className="text-center py-4">Loading schedule...</div>

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Time Slot</h3>
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={newSlot.day_of_week}
              onChange={(e) => setNewSlot({ ...newSlot, day_of_week: Number.parseInt(e.target.value) })}
              className="border rounded px-3 py-2"
            >
              {DAYS.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
            <Input
              type="time"
              value={newSlot.opening_time}
              onChange={(e) => setNewSlot({ ...newSlot, opening_time: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <Input
              type="time"
              value={newSlot.closing_time}
              onChange={(e) => setNewSlot({ ...newSlot, closing_time: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <Button onClick={handleAddSlot} className="bg-red-600 hover:bg-red-700">
              Add Slot
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Current Schedule</h3>
        <div className="space-y-2">
          {schedules.map((slot) => (
            <Card key={slot.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{DAYS[slot.day_of_week]}</div>
                <div className="text-sm text-gray-600">
                  {slot.opening_time} - {slot.closing_time}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={slot.is_active ? "default" : "outline"}
                  onClick={() => handleToggle(slot.id, slot.is_active)}
                >
                  {slot.is_active ? "Active" : "Inactive"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteSlot(slot.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
