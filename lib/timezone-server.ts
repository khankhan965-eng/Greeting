// Server-side timezone utilities using Node.js for accurate IST calculation
const IST_TIMEZONE = "Asia/Kolkata"

/**
 * Get current time in IST as a Date object (server-side)
 * This uses date-fns-tz for accurate timezone handling
 */
export function getCurrentDateInIST(): Date {
  // Use the Intl API for server-side timezone conversion
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

  for (const part of parts) {
    partMap[part.type] = part.value
  }

  const year = parseInt(partMap.year, 10)
  const month = parseInt(partMap.month, 10) - 1 // JS months are 0-indexed
  const day = parseInt(partMap.day, 10)
  const hour = parseInt(partMap.hour, 10)
  const minute = parseInt(partMap.minute, 10)
  const second = parseInt(partMap.second, 10)

  return new Date(year, month, day, hour, minute, second)
}

/**
 * Get current time in IST as minutes since midnight (server-side)
 */
export function getCurrentTimeInISTMinutes(): number {
  const istDate = getCurrentDateInIST()
  return istDate.getHours() * 60 + istDate.getMinutes()
}

/**
 * Get current day of week in IST (0 = Sunday, 6 = Saturday)
 */
export function getCurrentDayOfWeekIST(): number {
  const istDate = getCurrentDateInIST()
  return istDate.getDay()
}

/**
 * Parse time string (HH:MM 24-hour format) to minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0

  const cleanStr = timeStr.trim()
  const timeRegex = /^(\d{2}):(\d{2})$/
  const match = cleanStr.match(timeRegex)

  if (!match) return 0

  const hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)

  return hours * 60 + minutes
}

/**
 * Check if shop is open at a specific time slot
 */
export function isShopOpenInTimeSlot(openingTime: string, closingTime: string): boolean {
  const currentMinutes = getCurrentTimeInISTMinutes()
  const openMinutes = parseTimeToMinutes(openingTime)
  const closeMinutes = parseTimeToMinutes(closingTime)

  // Handle closing time past midnight (e.g., 10 PM to 2 AM)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

/**
 * Get all active time slots for a specific day
 */
export function getTodaySlotsServer(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): Array<{ opening_time: string; closing_time: string }> {
  const today = getCurrentDayOfWeekIST()

  const todaySchedules = schedules
    .filter((s) => s.is_closed !== true && s.day_of_week === today)
    .sort((a, b) => parseTimeToMinutes(a.opening_time) - parseTimeToMinutes(b.opening_time))

  return todaySchedules.map((s) => ({
    opening_time: s.opening_time,
    closing_time: s.closing_time,
  }))
}

/**
 * Check if shop is open today (server-side)
 */
export function isShopOpenTodayServer(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): boolean {
  const slots = getTodaySlotsServer(schedules)

  if (slots.length === 0) return false

  return slots.some((s) => isShopOpenInTimeSlot(s.opening_time, s.closing_time))
}

/**
 * Get current active slot (server-side)
 */
export function getCurrentActiveSlotServer(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): { opening_time: string; closing_time: string } | null {
  const slots = getTodaySlotsServer(schedules)
  const currentMinutes = getCurrentTimeInISTMinutes()

  for (const slot of slots) {
    const openMinutes = parseTimeToMinutes(slot.opening_time)
    const closeMinutes = parseTimeToMinutes(slot.closing_time)

    // Handle closing time past midnight
    if (closeMinutes < openMinutes) {
      if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) {
        return { opening_time: slot.opening_time, closing_time: slot.closing_time }
      }
    } else if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      return { opening_time: slot.opening_time, closing_time: slot.closing_time }
    }
  }

  return null
}

/**
 * Get next slot info (server-side)
 */
export function getNextSlotInfoServer(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): {
  slot: { opening_time: string; closing_time: string }
  isToday: boolean
  day: number
} | null {
  const today = getCurrentDayOfWeekIST()
  const currentMinutes = getCurrentTimeInISTMinutes()

  const activeSchedules = schedules.filter((s) => s.is_closed !== true)
  if (activeSchedules.length === 0) return null

  // Check today's remaining time slots
  const todaySchedules = activeSchedules
    .filter((s) => s.day_of_week === today)
    .sort((a, b) => parseTimeToMinutes(a.opening_time) - parseTimeToMinutes(b.opening_time))

  for (const schedule of todaySchedules) {
    const openMinutes = parseTimeToMinutes(schedule.opening_time)
    if (openMinutes > currentMinutes) {
      return {
        slot: { opening_time: schedule.opening_time, closing_time: schedule.closing_time },
        isToday: true,
        day: today,
      }
    }
  }

  // Find first schedule in next days
  for (let daysAhead = 1; daysAhead < 7; daysAhead++) {
    const nextDay = (today + daysAhead) % 7
    const nextDaySchedules = activeSchedules
      .filter((s) => s.day_of_week === nextDay)
      .sort((a, b) => parseTimeToMinutes(a.opening_time) - parseTimeToMinutes(b.opening_time))

    if (nextDaySchedules.length > 0) {
      return {
        slot: { opening_time: nextDaySchedules[0].opening_time, closing_time: nextDaySchedules[0].closing_time },
        isToday: false,
        day: nextDay,
      }
    }
  }

  return null
}
