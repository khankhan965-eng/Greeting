export function getISTDate(): Date {
  const now = new Date()
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
}

export function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = getISTDate()
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

  if (end < start) {
    return now >= start || now < end
  }

  return now >= start && now < end
}

/**
 * Checks if the current IST time has passed a specific time.
 */
export function isPastTime(timeStr: string): boolean {
  if (!timeStr) return false
  const now = getISTDate()
  const time = parseTime(timeStr)
  return now >= time
}
