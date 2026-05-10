import { createClient } from "@/lib/supabase/server"
import { isShopOpenTodayServer, getNextSlotInfoServer } from "@/lib/timezone-server"

export async function GET() {
  const supabase = await createClient()

  try {
    // Get schedule from database
    const { data: schedules, error: scheduleError } = await supabase
      .from("shop_schedule")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("opening_time", { ascending: true })

    if (scheduleError) {
      console.error("[v0] Schedule fetch error:", scheduleError)
      return Response.json(
        { status: "open", closeMessage: "" },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "CDN-Cache-Control": "no-cache",
          },
        },
      )
    }

    // Calculate status server-side based on IST timezone
    let finalStatus: "open" | "closed" = "open"
    let finalMessage = ""

    if (schedules && schedules.length > 0) {
      const isOpen = isShopOpenTodayServer(schedules)
      if (!isOpen) {
        finalStatus = "closed"
        const nextSlot = getNextSlotInfoServer(schedules)
        finalMessage = nextSlot
          ? `Closed. Will open ${nextSlot.isToday ? "at" : "tomorrow at"} ${nextSlot.slot.opening_time}`
          : "Closed. Check schedule for opening times"
      }
    }

    return Response.json(
      {
        status: finalStatus,
        closeMessage: finalMessage,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "CDN-Cache-Control": "no-cache",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Status calculation error:", error)
    return Response.json(
      { status: "open", closeMessage: "" },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "CDN-Cache-Control": "no-cache",
        },
      },
    )
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()

    if (!body.status || !["open", "closed"].includes(body.status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("shop_status")
      .update({
        status: body.status,
        close_message: body.closeMessage || "Sorry, RTC is closed at the moment. We'll be back soon!",
        updated_at: new Date().toISOString(),
      })
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase update error:", error)
      return Response.json({ error: "Failed to update status" }, { status: 500 })
    }

    return Response.json({
      status: data.status,
      closeMessage: data.close_message,
    })
  } catch (error) {
    console.error("[v0] Status update error:", error)
    return Response.json({ error: "Failed to update status" }, { status: 500 })
  }
}
