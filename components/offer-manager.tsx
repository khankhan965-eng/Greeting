"use client"

import { useState } from "react"
import { Tag, Plus, Trash2, Edit2, Clock } from "lucide-react"
import type { ShopData, Offer } from "@/types"

interface OfferManagerProps {
  data: ShopData
  onDataUpdate: (data: ShopData) => void
}

export default function OfferManager({ data, onDataUpdate }: OfferManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Offer>>({
    enabled: true,
    title: "",
    description: "",
    startTime: "09:00 AM",
    endTime: "10:00 PM",
  })

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in title and description")
      return
    }

    const currentOffers = data.offers || []
    let newOffers: Offer[]

    if (isAdding) {
      const newId = Math.max(...currentOffers.map((o) => o.id), 0) + 1
      newOffers = [...currentOffers, { ...(formData as Offer), id: newId }]
    } else {
      newOffers = currentOffers.map((o) => (o.id === editingId ? { ...o, ...formData } : o))
    }

    const updatedData = { ...data, offers: newOffers }
    onDataUpdate(updatedData)

    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })
      setIsAdding(false)
      setEditingId(null)
      setFormData({ enabled: true, title: "", description: "", startTime: "09:00 AM", endTime: "10:00 PM" })
    } catch (error) {
      console.error("[v0] Failed to save offer:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return

    const newOffers = (data.offers || []).filter((o) => o.id !== id)
    const updatedData = { ...data, offers: newOffers }
    onDataUpdate(updatedData)

    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })
    } catch (error) {
      console.error("[v0] Failed to delete offer:", error)
    }
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Tag className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-foreground">Time-Based Offers</h2>
        </div>
        {!isAdding && editingId === null && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Offer
          </button>
        )}
      </div>

      {(isAdding || editingId !== null) && (
        <div className="mb-6 p-4 bg-secondary rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Offer Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-input"
                placeholder="e.g., Morning Special"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Visibility Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-input text-xs"
                  placeholder="09:00 AM"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-input text-xs"
                  placeholder="12:00 PM"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-input"
              rows={2}
              placeholder="e.g., Get 20% off on all tea varieties..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="offerEnabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="offerEnabled" className="text-sm font-semibold">
              Enabled
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg">
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setEditingId(null)
              }}
              className="px-4 py-2 bg-muted rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(data.offers || []).map((offer) => (
          <div
            key={offer.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
          >
            <div className="flex-1">
              <h4 className="font-bold flex items-center gap-2">
                {offer.title}{" "}
                {!offer.enabled && <span className="text-xs font-normal text-muted-foreground">(Disabled)</span>}
              </h4>
              <p className="text-sm text-muted-foreground">{offer.description}</p>
              <div className="flex items-center gap-1 text-xs text-primary mt-1">
                <Clock size={12} /> {offer.startTime} - {offer.endTime}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(offer.id)
                  setFormData(offer)
                }}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(offer.id)}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
