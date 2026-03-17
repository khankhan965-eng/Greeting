const IST_TIMEZONE = "Asia/Kolkata"

/**
 * Convert local datetime-local input (which is in user's local timezone) to ISO string in Asia/Kolkata
 * Example: 2024-01-15T14:30 (from datetime-local input) → 2024-01-15T14:30:00+05:30 (ISO with IST offset)
 */
export function convertLocalToISTISO(datetimeLocalValue: string): string {
  if (!datetimeLocalValue || datetimeLocalValue === "undefined" || datetimeLocalValue === "") {
    console.error("[v0] Invalid datetime input to convertLocalToISTISO:", datetimeLocalValue)
    throw new Error(`Invalid datetime input: ${datetimeLocalValue}`)
  }

  // datetime-local gives us YYYY-MM-DDTHH:mm format in local browser timezone
  const localDate = new Date(datetimeLocalValue)
  
  if (isNaN(localDate.getTime())) {
    console.error("[v0] Failed to parse datetime:", datetimeLocalValue)
    throw new Error(`Failed to parse datetime: ${datetimeLocalValue}`)
  }

  // Get the time in IST timezone
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = istFormatter.formatToParts(localDate)
  const partMap: Record<string, string> = {}
  parts.forEach((part) => {
    partMap[part.type] = part.value
  })

  // Validate all parts exist
  if (!partMap.year || !partMap.month || !partMap.day || !partMap.hour || !partMap.minute || !partMap.second) {
    console.error("[v0] Missing date parts:", partMap)
    throw new Error("Failed to format datetime parts")
  }

  // Create ISO string with +05:30 offset for IST
  const isoString = `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}+05:30`
  console.log("[v0] convertLocalToISTISO result:", { input: datetimeLocalValue, output: isoString })
  return isoString
}

/**
 * Convert ISO string with timezone to datetime-local format for display/editing
 * Example: 2024-01-15T14:30:00+05:30 → 2024-01-15T14:30
 */
export function convertISTISOToLocal(isoString: string): string {
  if (!isoString) return ""

  try {
    const date = new Date(isoString)
    const istFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    const parts = istFormatter.formatToParts(date)
    const partMap: Record<string, string> = {}
    parts.forEach((part) => {
      partMap[part.type] = part.value
    })

    // Return in datetime-local format YYYY-MM-DDTHH:mm
    return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}`
  } catch (error) {
    console.error("[v0] Error converting ISO to local:", error)
    return ""
  }
}

/**
 * Format ISO datetime for display in IST timezone
 * Example: 2024-01-15T14:30:00+05:30 → "15 Jan 2024 14:30"
 */
export function formatISTDateTime(isoString: string): string {
  if (!isoString) return ""

  try {
    const date = new Date(isoString)
    return date.toLocaleString("en-IN", {
      timeZone: IST_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } catch (error) {
    console.error("[v0] Error formatting IST datetime:", error)
    return isoString
  }
}

/**
 * Get current time in ISO format for IST timezone
 */
export function getCurrentTimeISO(): string {
  const now = new Date()
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = istFormatter.formatToParts(now)
  const partMap: Record<string, string> = {}
  parts.forEach((part) => {
    partMap[part.type] = part.value
  })

  return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}+05:30`
}
