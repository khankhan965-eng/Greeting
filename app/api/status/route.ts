import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("shop_status")
      .select(
        "status, close_message, is_early_closing, early_closing_time, early_closing_reason, enable_auto_schedule, opening_time, closing_time, offers",
      )
      .limit(1)
      .single()

    if (error) {
      console.error("[v0] Supabase fetch error:", error)
      return Response.json(
        {
          status: "open",
          closeMessage: "Sorry, RTC is closed at the moment. We'll be back soon!",
          isEarlyClosing: false,
          earlyClosingTime: null,
          earlyClosingReason: null,
          enableAutoSchedule: false,
          dailyOpenTime: "09:00 AM",
          dailyCloseTime: "10:00 PM",
          offers: [],
        },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        },
      )
    }

    return Response.json(
      {
        status: data.status,
        closeMessage: data.close_message,
        isEarlyClosing: data.is_early_closing || false,
        earlyClosingTime: data.early_closing_time,
        earlyClosingReason: data.early_closing_reason,
        enableAutoSchedule: data.enable_auto_schedule || false,
        dailyOpenTime: data.opening_time || "09:00 AM",
        dailyCloseTime: data.closing_time || "10:00 PM",
        offers: data.offers || [],
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Status fetch error:", error)
    return Response.json(
      {
        status: "open",
        closeMessage: "Sorry, RTC is closed at the moment. We'll be back soon!",
        isEarlyClosing: false,
        earlyClosingTime: null,
        earlyClosingReason: null,
        enableAutoSchedule: false,
        dailyOpenTime: "09:00 AM",
        dailyCloseTime: "10:00 PM",
        offers: [],
      },
      { status: 500 },
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
        close_message: body.closeMessage,
        is_early_closing: body.isEarlyClosing,
        early_closing_time: body.earlyClosingTime,
        early_closing_reason: body.earlyClosingReason,
        enable_auto_schedule: body.enableAutoSchedule,
        opening_time: body.dailyOpenTime,
        closing_time: body.dailyCloseTime,
        offers: body.offers,
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
      isEarlyClosing: data.is_early_closing,
      earlyClosingTime: data.early_closing_time,
      earlyClosingReason: data.early_closing_reason,
      enableAutoSchedule: data.enable_auto_schedule,
      dailyOpenTime: data.opening_time,
      dailyCloseTime: data.closing_time,
      offers: data.offers,
    })
  } catch (error) {
    console.error("[v0] Status update error:", error)
    return Response.json({ error: "Failed to update status" }, { status: 500 })
  }
}
