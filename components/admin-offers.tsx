"use client"

import { Offer } from "@/types"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"

export function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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
      const res = await fetch("/api/offers")
      if (!res.ok) {
        setOffers([])
        return
      }
      const data = await res.json()
      setOffers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch offers:", error)
      setOffers([])
    }
  }

  const handleAddOffer = async () => {
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

    const startTime = new Date(newOffer.start_datetime)
    const endTime = new Date(newOffer.end_datetime)
    if (endTime <= startTime) {
      setError("End date/time must be after start date/time")
      return
    }

    setLoading(true)
    console.log("[v0] Submitting offer:", newOffer)

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOffer),
      })

      console.log("[v0] API response status:", res.status)
      const responseData = await res.json()
      console.log("[v0] API response data:", responseData)

      if (!res.ok) {
        setError(responseData.error || "Failed to create offer")
        return
      }

      setSuccess("Offer created successfully!")
      await fetchOffers()
      
      // Reset form
      setNewOffer({
        title: "",
        description: "",
        start_datetime: "",
        end_datetime: "",
        frequency: "always",
        show_timer: false,
        active: true,
      })

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create offer"
      console.error("[v0] Error creating offer:", error)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return

    try {
      await fetch(`/api/offers/${id}`, { method: "DELETE" })
      fetchOffers()
    } catch (error) {
      console.error("Failed to delete offer:", error)
    }
  }

  const handleToggleOffer = async (offer: Offer) => {
    try {
      await fetch(`/api/offers/${offer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...offer, active: !offer.active }),
      })
      fetchOffers()
    } catch (error) {
      console.error("Failed to toggle offer:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Offers</h2>

        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-4">Create New Offer</h3>
          
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
                <label className="text-sm font-medium">Start Date/Time</label>
                <Input
                  type="datetime-local"
                  value={newOffer.start_datetime}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, start_datetime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date/Time</label>
                <Input
                  type="datetime-local"
                  value={newOffer.end_datetime}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, end_datetime: e.target.value })
                  }
                />
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

            <Button
              onClick={handleAddOffer}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? "Creating..." : "Create Offer"}
            </Button>
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
                      <p>
                        Start:{" "}
                        {new Date(offer.start_datetime).toLocaleString()}
                      </p>
                      <p>
                        End: {new Date(offer.end_datetime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
