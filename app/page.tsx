"use client"

import { useEffect, useState } from "react"
import PublicPage from "@/components/public-page"
import AdminPage from "@/components/admin-page"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"public" | "admin">("public")
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  useEffect(() => {
    const handleStorageChange = () => {
      // Listen for storage changes from other tabs/windows
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleAdminAccess = (authenticated: boolean) => {
    setIsAdminAuthenticated(authenticated)
    if (authenticated) {
      setCurrentPage("admin")
    }
  }

  const handleLogout = () => {
    setIsAdminAuthenticated(false)
    setCurrentPage("public")
  }

  return (
    <main className="min-h-screen bg-background">
      {currentPage === "public" ? (
        <PublicPage onAdminClick={() => setCurrentPage("admin")} />
      ) : (
        <AdminPage isAuthenticated={isAdminAuthenticated} onAuthenticated={handleAdminAccess} onLogout={handleLogout} />
      )}
    </main>
  )
}
