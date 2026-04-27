"use client"

import { Offer } from "@/types"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Edit2, X } from "lucide-react"
import {
  convertLocalToISTISO,
  convertISTISOToLocal,
  formatISTDateTime,
} from "@/lib/timezone-utils"

export function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
    frequency: "always" as const,
    show_timer: false,
    active: true,
  })

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      console.log("[v0] Fetching offers for admin panel...");
      const res = await fetch("/api/offers?admin=true")
      if (!res.ok) {
        console.error("[v0] Failed to fetch offers - status:", res.status);
        setOffers([])
        return
      }
      const data = await res.json()
      console.log("[v0] Offers fetched successfully:", data?.length || 0);
      setOffers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[v0] Error fetching offers:", error)
      setOffers([])
    }
  }

  const handleSaveOffer = async () => {
    setError(null)
    setSuccess(null)

    // Validation
    if (!newOffer.title.trim()) {
      setError("Offer title is required")
      return
    }
    if (!newOffer.description.trim()) {
      setError("Offer description is required")
      return
    }
    if (!newOffer.start_datetime) {
      setError("Start date/time is required")
      return
    }
    if (!newOffer.end_datetime) {
      setError("End date/time is required")
      return
    }

    // Convert local datetime inputs to ISO format with IST timezone
    let startISO: string
    let endISO: string
    
    try {
      startISO = convertLocalToISTISO(newOffer.start_datetime)
      console.log("[v0] Start datetime converted:", startISO)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to convert start date/time"
      console.error("[v0] Start datetime conversion error:", errMsg)
      setError(errMsg)
      return
    }

    try {
      endISO = convertLocalToISTISO(newOffer.end_datetime)
      console.log("[v0] End datetime converted:", endISO)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to convert end date/time"
      console.error("[v0] End datetime conversion error:", errMsg)
      setError(errMsg)
      return
    }

    const startTime = new Date(startISO)
    const endTime = new Date(endISO)
    
    if (isNaN(startTime.getTime())) {
      setError("Invalid start date/time")
      return
    }
    if (isNaN(endTime.getTime())) {
      setError("Invalid end date/time")
      return
    }

    if (endTime <= startTime) {
      setError("End date/time must be after start date/time")
      return
    }

    setLoading(true)

    try {
      const isEditing = editingId !== null
      const method = isEditing ? "PUT" : "POST"
      const url = isEditing ? `/api/offers/${editingId}` : "/api/offers"
      
      // Prepare payload - ensure no undefined values
      const payload = {
        title: newOffer.title.trim(),
        description: newOffer.description.trim(),
        start_datetime: startISO,
        end_datetime: endISO,
        frequency: newOffer.frequency || "always",
        show_timer: Boolean(newOffer.show_timer),
        active: Boolean(newOffer.active),
      }

      // Validate payload has no undefined values
      for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null) {
          console.error("[v0] Payload validation failed - undefined value:", key)
          setError(`Invalid ${key} - cannot be empty`)
          setLoading(false)
          return
        }
      }

      console.log("[v0] Sending offer payload:", payload)

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()

      console.log("[v0] API response status:", res.status, "data:", responseData)

      if (!res.ok) {
        setError(responseData.error || `Failed to ${isEditing ? "update" : "create"} offer`)
        return
      }

      const successMsg = isEditing ? "Offer updated successfully!" : "Offer created successfully!"
      setSuccess(successMsg)
      await fetchOffers()

      // Reset form and editing state
      setNewOffer({
        title: "",
        description: "",
        start_datetime: "",
        end_datetime: "",
        frequency: "always",
        show_timer: false,
        active: true,
      })
      setEditingId(null)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to save offer"
      console.error("[v0] Error saving offer:", error)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleEditOffer = (offer: Offer) => {
    setEditingId(offer.id)
    setNewOffer({
      title: offer.title,
      description: offer.description,
      start_datetime: convertISTISOToLocal(offer.start_datetime),
      end_datetime: convertISTISOToLocal(offer.end_datetime),
      frequency: offer.frequency as any,
      show_timer: offer.show_timer,
      active: offer.active,
    })
    setError(null)
    setSuccess(null)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewOffer({
      title: "",
      description: "",
      start_datetime: "",
      end_datetime: "",
      frequency: "always",
      show_timer: false,
      active: true,
    })
    setError(null)
  }

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return

    try {
      console.log("[v0] Deleting offer:", id);
      const res = await fetch(`/api/offers/${id}`, { method: "DELETE" })
      const data = await res.json();
      if (!res.ok) {
        console.error("[v0] Delete failed:", data);
        setError(data.error || "Failed to delete offer");
        return;
      }
      console.log("[v0] Offer deleted successfully");
      setSuccess("Offer deleted successfully!");
      await fetchOffers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("[v0] Error deleting offer:", error);
      setError(error instanceof Error ? error.message : "Failed to delete offer");
    }
  }

  const handleToggleOffer = async (offer: Offer) => {
    try {
      console.log("[v0] Toggling offer active status:", offer.id, "current:", offer.active);
      const { id, ...offerData } = offer;
      const res = await fetch(`/api/offers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...offerData, active: !offer.active }),
      })
      const data = await res.json();
      if (!res.ok) {
        console.error("[v0] Toggle failed:", data);
        setError(data.error || "Failed to toggle offer");
        return;
      }
      console.log("[v0] Offer toggled successfully");
      setSuccess(`Offer ${!offer.active ? "enabled" : "disabled"} successfully!`);
      await fetchOffers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("[v0] Error toggling offer:", error);
      setError(error instanceof Error ? error.message : "Failed to toggle offer");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Offers</h2>

        <Card className="p-4 mb-6 border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {editingId ? "Edit Offer" : "Create New Offer"}
            </h3>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                aria-label="Cancel edit"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✓ {success}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              placeholder="Offer Title"
              value={newOffer.title}
              onChange={(e) =>
                setNewOffer({ ...newOffer, title: e.target.value })
              }
            />
            <textarea
              placeholder="Offer Description"
              value={newOffer.description}
              onChange={(e) =>
                setNewOffer({ ...newOffer, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2 min-h-20"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Start Date/Time (Asia/Kolkata)</label>
                <Input
                  type="datetime-local"
                  value={newOffer.start_datetime}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, start_datetime: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400 mt-1">IST (UTC+5:30)</p>
              </div>
              <div>
                <label className="text-sm font-medium">End Date/Time (Asia/Kolkata)</label>
                <Input
                  type="datetime-local"
                  value={newOffer.end_datetime}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, end_datetime: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400 mt-1">IST (UTC+5:30)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select
                  value={newOffer.frequency}
                  onChange={(e) =>
                    setNewOffer({
                      ...newOffer,
                      frequency: e.target.value as any,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="always">Always</option>
                  <option value="once_per_day">Once Per Day</option>
                  <option value="first_time">First Time</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={newOffer.show_timer}
                    onChange={(e) =>
                      setNewOffer({
                        ...newOffer,
                        show_timer: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-medium">Show Timer</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveOffer}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? "Saving..." : editingId ? "Update Offer" : "Create Offer"}
              </Button>
              {editingId && (
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="font-semibold">Active Offers</h3>
          {offers.length === 0 ? (
            <p className="text-gray-500">No offers yet</p>
          ) : (
            offers.map((offer) => (
              <Card key={offer.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-red-600">{offer.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {offer.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>Start: {formatISTDateTime(offer.start_datetime)}</p>
                      <p>End: {formatISTDateTime(offer.end_datetime)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleEditOffer(offer)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                      title="Edit offer"
                    >
                      <Edit2 size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleOffer(offer)}
                      variant="outline"
                      size="sm"
                    >
                      {offer.active ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      onClick={() => handleDeleteOffer(offer.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
