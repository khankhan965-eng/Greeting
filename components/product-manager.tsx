"use client"

import { useState } from "react"
import { Trash2, Edit2, Eye, EyeOff, Plus } from "lucide-react"
import type { ShopData, Product } from "@/types"

interface ProductManagerProps {
  data: ShopData
  onDataUpdate: (data: ShopData) => void
}

export default function ProductManager({ data, onDataUpdate }: ProductManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    desc: "",
    price: "",
    available: true,
  })

  const handleAddProduct = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      name: "",
      desc: "",
      price: "",
      available: true,
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id)
    setIsAdding(false)
    setFormData(product)
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in name and price")
      return
    }

    let newProducts = [...data.products]

    if (isAdding) {
      const newId = Math.max(...data.products.map((p) => p.id), 0) + 1
      newProducts.push({
        id: newId,
        name: formData.name,
        desc: formData.desc || "",
        price: formData.price,
        available: formData.available || true,
      })
    } else if (editingId) {
      newProducts = newProducts.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: formData.name!,
              desc: formData.desc || "",
              price: formData.price!,
              available: formData.available || true,
            }
          : p,
      )
    }

    onDataUpdate({ ...data, products: newProducts })
    setEditingId(null)
    setIsAdding(false)
    setFormData({ name: "", desc: "", price: "", available: true })
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      onDataUpdate({
        ...data,
        products: data.products.filter((p) => p.id !== id),
      })
    }
  }

  const handleToggleAvailability = (id: number) => {
    onDataUpdate({
      ...data,
      products: data.products.map((p) => (p.id === id ? { ...p, available: !p.available } : p)),
    })
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Products</h2>
        {!isAdding && editingId === null && (
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      {/* Product Form */}
      {(isAdding || editingId !== null) && (
        <div className="mb-6 p-4 bg-secondary rounded-lg border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="e.g., Tea (10 INR)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Price</label>
              <input
                type="text"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
            <textarea
              value={formData.desc || ""}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              rows={2}
              placeholder="e.g., Masala chai"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="available"
              checked={formData.available || false}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="available" className="text-sm font-semibold text-foreground">
              Available
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveProduct}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
            >
              Save Product
            </button>
            <button
              onClick={() => {
                setEditingId(null)
                setIsAdding(false)
                setFormData({ name: "", desc: "", price: "", available: true })
              }}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/90 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-3">
        {data.products.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No products yet. Add one to get started!</p>
        ) : (
          data.products.map((product) => (
            <div
              key={product.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg transition-opacity ${
                product.available ? "border-border bg-background" : "border-muted bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex-1 w-full">
                <h4 className="font-semibold text-foreground">{product.name}</h4>
                <p className="text-sm text-muted-foreground">{product.desc}</p>
                <p className="text-sm font-semibold text-primary mt-1">₹{product.price}</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleToggleAvailability(product.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-semibold ${
                    product.available
                      ? "bg-[var(--status-open)] text-white hover:bg-[var(--status-open)]/90"
                      : "bg-muted text-muted-foreground hover:bg-muted/90"
                  }`}
                >
                  {product.available ? (
                    <>
                      <Eye size={16} />
                      <span className="hidden sm:inline">Available</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} />
                      <span className="hidden sm:inline">Unavailable</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleEditProduct(product)}
                  className="flex items-center gap-1 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-semibold"
                >
                  <Edit2 size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-semibold"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
