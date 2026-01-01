export function getISTDate(): Date {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const partValues: Record<string, number> = {}
  parts.forEach((part) => {
    if (part.type !== "literal") {
      partValues[part.type] = Number.parseInt(part.value, 10)
    }
  })

  // Create a Date object representing the current IST time as if it were local time
  return new Date(
    partValues.year,
    partValues.month - 1,
    partValues.day,
    partValues.hour,
    partValues.minute,
    partValues.second,
  )
}

export function parseTime(timeStr: string): Date {
  if (!timeStr) return new Date(0)

  const now = getISTDate()
  const date = new Date(now)

  let hours = 0
  let minutes = 0

  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
  if (timeMatch) {
    hours = Number.parseInt(timeMatch[1], 10)
    minutes = Number.parseInt(timeMatch[2], 10)
    const modifier = timeMatch[3]?.toUpperCase()

    if (modifier === "PM" && hours < 12) hours += 12
    if (modifier === "AM" && hours === 12) hours = 0
  } else {
    // Fallback for HH:mm 24h format
    const parts = timeStr.split(":")
    hours = Number.parseInt(parts[0], 10) || 0
    minutes = Number.parseInt(parts[1], 10) || 0
  }

  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Checks if the current IST time is within a specified range.
 * Supports cross-midnight ranges (e.g., 22:00 to 02:00).
 */
export function isWithinTimeRange(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false
  const now = getISTDate()
  const start = parseTime(startTime)
  const end = parseTime(endTime)

  const nowMs = now.getTime()
  const startMs = start.getTime()
  const endMs = end.getTime()

  if (endMs < startMs) {
    // Range crosses midnight
    return nowMs >= startMs || nowMs < endMs
  }

  return nowMs >= startMs && nowMs < endMs
}

/**
 * Checks if the current IST time has passed a specific time.
 */
export function isPastTime(timeStr: string): boolean {
  if (!timeStr) return false
  const now = getISTDate()
  const time = parseTime(timeStr)
  return now.getTime() >= time.getTime()
}
