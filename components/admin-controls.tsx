"use client"

import type React from "react"
import OfferManager from "./offer-manager"
import { useState } from "react"
import { Download, Upload, Info } from "lucide-react"
import ShopStatusControl from "./shop-status-control"
import EarlyClosingControl from "./early-closing-control"
import ProductManager from "./product-manager"
import PreviewPane from "./preview-pane"
import ChangePassword from "./change-password"
import type { ShopData } from "@/types"

interface AdminControlsProps {
  data: ShopData
  onDataUpdate: (data: ShopData) => void
  showInstructions: boolean
  onCloseInstructions: () => void
}

export default function AdminControls({
  data,
  onDataUpdate,
  showInstructions,
  onCloseInstructions,
}: AdminControlsProps) {
  const [activeTab, setActiveTab] = useState<"manage" | "preview">("manage")

  const handleExport = () => {
    const storedAuth = localStorage.getItem("rtc_auth_state")
    const authState = storedAuth ? JSON.parse(storedAuth) : {}

    const backup = {
      data,
      auth: authState,
    }

    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rtc-backup.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)

        if (imported.data) {
          // New format with auth included
          const { data: newData, auth } = imported
          if (newData.shopName && newData.status && newData.products) {
            onDataUpdate(newData)
            if (auth && auth.passwordHash) {
              localStorage.setItem("rtc_auth_state", JSON.stringify(auth))
            }
            alert("Data and settings imported successfully!")
          } else {
            alert("Invalid backup file format")
          }
        } else if (imported.shopName && imported.status && imported.products) {
          // Old format - data only
          onDataUpdate(imported)
          alert("Data imported successfully!")
        } else {
          alert("Invalid backup file format")
        }
      } catch {
        alert("Failed to parse backup file")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {showInstructions && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <Info className="text-accent flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Admin Panel Guide</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Initial password: <code className="bg-background px-2 py-1 rounded">khan@786</code>
                  </li>
                  <li>• Change your password in the "Change Admin Password" section below</li>
                  <li>• All changes are saved to browser localStorage</li>
                  <li>• Use Export/Import to backup your data (includes password)</li>
                  <li>• Changes appear live on the public page</li>
                </ul>
              </div>
            </div>
            <button
              onClick={onCloseInstructions}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "manage"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Manage Shop
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "preview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
      </div>

      {activeTab === "manage" ? (
        <div className="space-y-8">
          <ChangePassword />

          <ShopStatusControl data={data} onDataUpdate={onDataUpdate} />

          <EarlyClosingControl data={data} onDataUpdate={onDataUpdate} />

          <OfferManager data={data} onDataUpdate={onDataUpdate} />

          <ProductManager data={data} onDataUpdate={onDataUpdate} />

          {/* Export/Import */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">Backup & Restore</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download size={18} />
                Export Data
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer">
                <Upload size={18} />
                Import Data
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <PreviewPane data={data} />
      )}
    </div>
  )
}
