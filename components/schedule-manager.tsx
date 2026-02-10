"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, X } from "lucide-react"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface TimeSlot {
  id: string
  day_of_week: number
  opening_time: string
  closing_time: string
  is_closed: boolean
}

interface EditModalState {
  isOpen: boolean
  slot: TimeSlot | null
  day_of_week: number
  opening_time: string
  closing_time: string
}

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [newSlot, setNewSlot] = useState({
    day_of_week: 0,
    opening_time: "09:00",
    closing_time: "22:00",
  })

  const [openingHour, setOpeningHour] = useState("09")
  const [openingMinute, setOpeningMinute] = useState("00")
  const [closingHour, setClosingHour] = useState("22")
  const [closingMinute, setClosingMinute] = useState("00")

  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    slot: null,
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
        setOpeningHour("09")
        setOpeningMinute("00")
        setClosingHour("22")
        setClosingMinute("00")
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

  const handleToggle = async (id: string, isClosed: boolean) => {
    const newIsClosed = !isClosed
    
    // Update local state immediately for instant UI feedback
    setSchedules(schedules.map((s) => (s.id === id ? { ...s, is_closed: newIsClosed } : s)))

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          data: { id, is_closed: newIsClosed },
        }),
      })

      if (!response.ok) {
        // Revert state on error
        setSchedules(schedules.map((s) => (s.id === id ? { ...s, is_closed: isClosed } : s)))
      }
    } catch (error) {
      console.error("Error toggling slot:", error)
      // Revert state on error
      setSchedules(schedules.map((s) => (s.id === id ? { ...s, is_closed: isClosed } : s)))
    }
  }

  const handleOpenEditModal = (slot: TimeSlot) => {
    setEditModal({
      isOpen: true,
      slot,
      day_of_week: slot.day_of_week,
      opening_time: slot.opening_time,
      closing_time: slot.closing_time,
    })
  }

  const handleCloseEditModal = () => {
    setEditModal({
      isOpen: false,
      slot: null,
      day_of_week: 0,
      opening_time: "09:00",
      closing_time: "22:00",
    })
  }

  const handleSaveEdit = async () => {
    if (!editModal.slot) return

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          data: {
            id: editModal.slot.id,
            day_of_week: editModal.day_of_week,
            opening_time: editModal.opening_time,
            closing_time: editModal.closing_time,
          },
        }),
      })

      if (response.ok) {
        fetchSchedules()
        handleCloseEditModal()
      }
    } catch (error) {
      console.error("Error editing slot:", error)
    }
  }

  const handleBulkToggle = async () => {
    const anyActive = schedules.some((s) => !s.is_closed)
    const newIsClosed = anyActive // if anyActive, set is_closed to true (deactivate)
    const confirmed = window.confirm(
      `Are you sure you want to ${anyActive ? "deactivate" : "activate"} all schedules?`
    )

    if (!confirmed) return

    // Store original state for rollback
    const originalSchedules = [...schedules]
    
    // Update local state immediately for instant UI feedback
    setSchedules(schedules.map((s) => ({ ...s, is_closed: newIsClosed })))

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-toggle",
          data: { is_closed: newIsClosed },
        }),
      })

      if (!response.ok) {
        // Revert state on error
        setSchedules(originalSchedules)
      }
    } catch (error) {
      console.error("Error bulk toggling schedules:", error)
      // Revert state on error
      setSchedules(originalSchedules)
    }
  }

  if (loading) return <div className="text-center py-4">Loading schedule...</div>

  const anyActive = schedules.length > 0 && schedules.some((s) => !s.is_closed)

  return (
    <div className="space-y-6">
      {/* Add New Time Slot */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Time Slot</h3>
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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

            {/* Opening Time */}
            <div className="flex gap-1">
              <select
                value={openingHour}
                onChange={(e) => {
                  setOpeningHour(e.target.value)
                  setNewSlot({ ...newSlot, opening_time: `${e.target.value}:${openingMinute}` })
                }}
                className="border rounded px-2 py-2 flex-1 text-center"
              >
                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="flex items-center">:</span>
              <select
                value={openingMinute}
                onChange={(e) => {
                  setOpeningMinute(e.target.value)
                  setNewSlot({ ...newSlot, opening_time: `${openingHour}:${e.target.value}` })
                }}
                className="border rounded px-2 py-2 flex-1 text-center"
              >
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Closing Time */}
            <div className="flex gap-1">
              <select
                value={closingHour}
                onChange={(e) => {
                  setClosingHour(e.target.value)
                  setNewSlot({ ...newSlot, closing_time: `${e.target.value}:${closingMinute}` })
                }}
                className="border rounded px-2 py-2 flex-1 text-center"
              >
                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="flex items-center">:</span>
              <select
                value={closingMinute}
                onChange={(e) => {
                  setClosingMinute(e.target.value)
                  setNewSlot({ ...newSlot, closing_time: `${closingHour}:${e.target.value}` })
                }}
                className="border rounded px-2 py-2 flex-1 text-center"
              >
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleAddSlot} className="bg-red-600 hover:bg-red-700 col-span-1">
              Add Slot
            </Button>
          </div>
        </Card>
      </div>

      {/* Current Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Schedule</h3>
          {schedules.length > 0 && (
            <Button
              onClick={handleBulkToggle}
              className={`${
                anyActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              } text-white text-sm`}
            >
              {anyActive ? "Deactivate All" : "Activate All"}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {schedules.map((slot) => (
            <Card
              key={slot.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{DAYS[slot.day_of_week]}</div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      !slot.is_closed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {!slot.is_closed ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {slot.opening_time} - {slot.closing_time}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 hover:bg-blue-50 border-blue-200 bg-transparent"
                  onClick={() => handleOpenEditModal(slot)}
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={!slot.is_closed ? "default" : "outline"}
                  className={
                    !slot.is_closed
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                  onClick={() => handleToggle(slot.id, slot.is_closed)}
                >
                  {!slot.is_closed ? "Active" : "Inactive"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200 bg-transparent"
                  onClick={() => handleDeleteSlot(slot.id)}
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.slot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button
              onClick={handleCloseEditModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6">Edit Schedule</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Day</label>
                <select
                  value={editModal.day_of_week}
                  onChange={(e) =>
                    setEditModal({ ...editModal, day_of_week: Number.parseInt(e.target.value) })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={editModal.opening_time}
                  onChange={(e) =>
                    setEditModal({ ...editModal, opening_time: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={editModal.closing_time}
                  onChange={(e) =>
                    setEditModal({ ...editModal, closing_time: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Save
                </Button>
                <Button
                  onClick={handleCloseEditModal}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
