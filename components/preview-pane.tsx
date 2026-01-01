"use client"

import type { ShopData } from "@/types"
import Header from "./header"
import ProductGrid from "./product-grid"
import Footer from "./footer"

interface PreviewPaneProps {
  data: ShopData
}

export default function PreviewPane({ data }: PreviewPaneProps) {
  const availableProducts = data.products.filter((p) => p.available)

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border shadow-lg">
      <div className="bg-muted/50 p-4 border-b border-border">
        <p className="text-sm text-muted-foreground">Preview of Public Page</p>
      </div>

      <div className="bg-background overflow-y-auto max-h-[800px]">
        <div className="scale-75 origin-top-left w-[133.333%] h-[133.333%]">
          <Header shopName={data.shopName} status={data.status} onAdminClick={() => {}} />

          {data.status === "closed" && (
            <div className="bg-gradient-to-r from-[var(--status-closed)] to-[var(--status-closed)]/90 text-primary-foreground">
              <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">We're Currently Closed</h2>
                <p className="text-lg sm:text-xl opacity-95">{data.closeMessage}</p>
              </div>
            </div>
          )}

          {data.status === "open" && (
            <div className="bg-gradient-to-r from-[var(--status-open)] to-[var(--status-open)]/90 text-white">
              <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">We're Open!</h2>
                <p className="text-lg sm:text-xl opacity-95">Welcome — we're serving now</p>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Our Products</h1>

            {availableProducts.length > 0 ? (
              <ProductGrid products={availableProducts} showUnavailable={false} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products available</p>
              </div>
            )}
          </div>

          <Footer shopName={data.shopName} />
        </div>
      </div>
    </div>
  )
}
