"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { verifyPassword } from "@/lib/auth"

interface AdminLoginProps {
  onAuthenticated: (authenticated: boolean) => void
}

export default function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      const stored = localStorage.getItem("rtc_auth_state")
      if (!stored) {
        const { getInitialAuthState } = await import("@/lib/storage")
        const authState = await getInitialAuthState()
        localStorage.setItem("rtc_auth_state", JSON.stringify(authState))
      }
    }
    initializeAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const storedAuth = localStorage.getItem("rtc_auth_state")
      if (!storedAuth) {
        setError("Authentication system not initialized")
        setLoading(false)
        return
      }

      const authState = JSON.parse(storedAuth)
      const isValid = await verifyPassword(password, authState.passwordHash)

      if (isValid) {
        onAuthenticated(true)
      } else {
        setError("Incorrect password")
        setPassword("")
      }
    } catch (err) {
      setError("Authentication error")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-primary text-primary-foreground p-4 rounded-full">
              <Lock size={32} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-foreground mb-2">Admin Access</h1>
          <p className="text-center text-muted-foreground mb-8">Enter the password to access admin controls</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Unlock Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
