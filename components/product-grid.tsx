"use client"

import type { Product } from "@/types"
import { CheckCircle2, X } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  showUnavailable: boolean
}

const productBadges: Record<string, string> = {
  "Masala Tea": "⭐ Special",
  "Ginger Tea": "🔥 Popular",
  "Lemon Tea": "🕒 Evening",
}

export default function ProductGrid({ products, showUnavailable }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className={`bg-white rounded-xl p-6 border transition-all hover:shadow-lg product-card ${
            product.available
              ? "border-green-300 hover:border-green-500 hover:shadow-md opacity-100"
              : "border-gray-300 opacity-50"
          }`}
        >
          {product.available && productBadges[product.name] && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                {productBadges[product.name]}
              </span>
            </div>
          )}

          {/* Product Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.desc}</p>
          </div>

          {/* Footer with Price and Availability Badge */}
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                product.available ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
              }`}
            >
              {product.available ? <CheckCircle2 size={20} /> : <X size={20} />}
            </div>
          </div>

          {/* Availability Text */}
          <p className={`text-xs font-semibold mt-3 ${product.available ? "text-green-600" : "text-gray-500"}`}>
            {product.available ? "Available" : "Not available"}
          </p>
        </div>
      ))}
    </div>
  )
}
