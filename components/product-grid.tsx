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
  // Add null safety
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md product-card overflow-hidden ${
            product.available
              ? "border-gray-200 hover:border-primary/50 opacity-100"
              : "border-gray-200 opacity-60"
          }`}
        >
          {/* Header with Badge */}
          <div className="px-5 pt-4 pb-2">
            {product.available && productBadges[product.name] && (
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-2">
                {productBadges[product.name]}
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="px-5 pb-4">
            <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-2">{product.desc}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Footer with Price and Availability */}
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full ${
                product.available ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
              }`}
            >
              {product.available ? <CheckCircle2 size={20} /> : <X size={20} />}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
