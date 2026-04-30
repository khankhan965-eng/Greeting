// Utility functions for shop scheduling with IST timezone
// Based on the provided where.ts logic

const IST_TIMEZONE = "Asia/Kolkata"

// Parse time string (HH:MM 24-hour format) to minutes since midnight
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

// Get current time in IST as minutes since midnight
export function getCurrentTimeInIST(): number {
  const now = new Date()
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: IST_TIMEZONE }))
  return istTime.getHours() * 60 + istTime.getMinutes()
}

// Get current day of week (0 = Sunday, 6 = Saturday) in IST
export function getCurrentDayOfWeekIST(): number {
  const now = new Date()
  const istDate = new Date(now.toLocaleString("en-US", { timeZone: IST_TIMEZONE }))
  return istDate.getDay()
}

// Check if current time falls within opening and closing times
export function isShopOpenInTimeSlot(openingTime: string, closingTime: string): boolean {
  const currentMinutes = getCurrentTimeInIST()
  const openMinutes = parseTimeToMinutes(openingTime)
  const closeMinutes = parseTimeToMinutes(closingTime)

  // Handle closing time past midnight (e.g., 10 PM to 2 AM)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

// Convert 24-hour time to 12-hour format (HH:MM → HH:MM AM/PM)
export function formatTime12Hour(time24: string): string {
  if (!time24) return ""
  
  const [hours, minutes] = time24.split(":")
  const hour = Number.parseInt(hours, 10)
  const isAM = hour < 12
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  
  return `${String(hour12).padStart(2, "0")}:${minutes} ${isAM ? "AM" : "PM"}`
}

// Get all active time slots for today
export function getTodaySlots(
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

// Format today's slots as a display string (e.g., "09:10 AM – 12:45 PM, 05:10 PM – 10:45 PM")
export function formatTodaySlots(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): string {
  const slots = getTodaySlots(schedules)
  
  if (slots.length === 0) return "Closed Today"
  
  return slots
    .map((s) => `${formatTime12Hour(s.opening_time)} – ${formatTime12Hour(s.closing_time)}`)
    .join(", ")
}

// Check if shop is open today based on schedule
export function isShopOpenToday(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): boolean {
  const slots = getTodaySlots(schedules)
  
  // If no active slots today, shop is closed
  if (slots.length === 0) return false

  // Check if current time falls within ANY of today's time slots
  return slots.some((s) => isShopOpenInTimeSlot(s.opening_time, s.closing_time))
}

// Get current active slot if shop is open
export function getCurrentActiveSlot(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): { opening_time: string; closing_time: string } | null {
  const slots = getTodaySlots(schedules)
  const currentMinutes = getCurrentTimeInIST()

  for (const slot of slots) {
    const openMinutes = parseTimeToMinutes(slot.opening_time)
    const closeMinutes = parseTimeToMinutes(slot.closing_time)

    // Handle closing time past midnight (e.g., 10 PM to 2 AM)
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

// Get next opening time based on schedule
export function getNextOpeningTime(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): string | null {
  const today = getCurrentDayOfWeekIST()
  const currentMinutes = getCurrentTimeInIST()

  const activeSchedules = schedules.filter((s) => s.is_closed !== true)
  if (activeSchedules.length === 0) return null

  // Check today's remaining time slots
  const todaySchedules = activeSchedules
    .filter((s) => s.day_of_week === today)
    .sort((a, b) => parseTimeToMinutes(a.opening_time) - parseTimeToMinutes(b.opening_time))

  for (const schedule of todaySchedules) {
    const openMinutes = parseTimeToMinutes(schedule.opening_time)
    if (openMinutes > currentMinutes) {
      return schedule.opening_time
    }
  }

  // Find first schedule in next days
  for (let daysAhead = 1; daysAhead < 7; daysAhead++) {
    const nextDay = (today + daysAhead) % 7
    const nextDaySchedules = activeSchedules
      .filter((s) => s.day_of_week === nextDay)
      .sort((a, b) => parseTimeToMinutes(a.opening_time) - parseTimeToMinutes(b.opening_time))

    if (nextDaySchedules.length > 0) {
      return nextDaySchedules[0].opening_time
    }
  }

  return null
}

// Get time remaining until closing (in minutes and formatted string)
export function getTimeUntilClosing(
  schedules: Array<{ day_of_week: number; opening_time: string; closing_time: string; is_closed?: boolean }>,
): { hours: number; minutes: number; formatted: string } | null {
  const activeSlot = getCurrentActiveSlot(schedules)
  if (!activeSlot) return null

  const currentMinutes = getCurrentTimeInIST()
  const closingMinutes = parseTimeToMinutes(activeSlot.closing_time)
  
  let minutesLeft = closingMinutes - currentMinutes
  
  // Handle closing time past midnight
  if (closingMinutes < parseTimeToMinutes(activeSlot.opening_time)) {
    if (currentMinutes < closingMinutes) {
      // Current time is after midnight, closing time is also after midnight
      minutesLeft = closingMinutes - currentMinutes
    } else {
      // Current time is before midnight, closing time is after midnight
      minutesLeft = (24 * 60 - currentMinutes) + closingMinutes
    }
  }

  if (minutesLeft <= 0) return null

  const hours = Math.floor(minutesLeft / 60)
  const minutes = minutesLeft % 60
  const formatted = `${hours}h ${minutes}m`

  return { hours, minutes, formatted }
}
