import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("shop_status")
      .select("status, close_message, is_early_closing, early_closing_time, early_closing_reason")
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
        close_message: body.closeMessage || "Sorry, RTC is closed at the moment. We'll be back soon!",
        is_early_closing: body.isEarlyClosing || false,
        early_closing_time: body.earlyClosingTime || null,
        early_closing_reason: body.earlyClosingReason || null,
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
    })
  } catch (error) {
    console.error("[v0] Status update error:", error)
    return Response.json({ error: "Failed to update status" }, { status: 500 })
  }
}
