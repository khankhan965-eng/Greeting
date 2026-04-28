import React from "react"

interface CTAButtonProps {
  text?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function CTAButton({
  text = "Get Offer",
  onClick,
  disabled = false,
  className = "",
}: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-semibold py-3 px-6 text-white transition-colors duration-200 rounded-lg ${className}`}
      style={{
        backgroundColor: disabled ? "#CCCCCC" : "#E53935",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#C1302A"
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#E53935"
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#B8271F"
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#C1302A"
        }
      }}
    >
      {text}
    </button>
  )
}
