"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { verifyPassword, hashPassword } from "@/lib/auth"

interface ChangePasswordProps {
  onPasswordChanged?: () => void
}

export default function ChangePassword({ onPasswordChanged }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validation
      if (!currentPassword) {
        setError("Current password is required")
        setLoading(false)
        return
      }
      if (!newPassword) {
        setError("New password is required")
        setLoading(false)
        return
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters")
        setLoading(false)
        return
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation do not match")
        setLoading(false)
        return
      }

      const storedAuth = localStorage.getItem("rtc_auth_state")
      if (!storedAuth) {
        setError("Authentication system not initialized")
        setLoading(false)
        return
      }

      const authState = JSON.parse(storedAuth)

      const isValid = await verifyPassword(currentPassword, authState.passwordHash)
      if (!isValid) {
        setError("Current password is incorrect")
        setLoading(false)
        return
      }

      const newHash = await hashPassword(newPassword)
      authState.passwordHash = newHash
      localStorage.setItem("rtc_auth_state", JSON.stringify(authState))

      setSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      if (onPasswordChanged) {
        onPasswordChanged()
      }
    } catch (err) {
      setError("Failed to change password")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const PasswordField = ({
    label,
    value,
    onChange,
    show,
    onToggle,
    disabled,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    show: boolean
    onToggle: () => void
    disabled: boolean
  }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-4">Change Admin Password</h3>

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
          disabled={loading}
        />

        <PasswordField
          label="New Password (min 6 characters)"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
          disabled={loading}
        />

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm(!showConfirm)}
          disabled={loading}
        />

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  )
}
