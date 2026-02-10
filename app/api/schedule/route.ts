import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: schedules, error } = await supabase
      .from("shop_schedule")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("opening_time", { ascending: true })

    if (error) throw error

    return NextResponse.json({ schedules: schedules || [] })
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { action, data } = body

    if (action === "add") {
      const { day_of_week, opening_time, closing_time } = data

      const { error } = await supabase
        .from("shop_schedule")
        .insert([{ day_of_week, opening_time, closing_time, is_closed: false }])

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === "delete") {
      const { id } = data

      const { error } = await supabase.from("shop_schedule").delete().eq("id", id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === "toggle") {
      const { id, is_closed } = data

      const { error } = await supabase.from("shop_schedule").update({ is_closed }).eq("id", id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === "edit") {
      const { id, day_of_week, opening_time, closing_time } = data

      const { error } = await supabase
        .from("shop_schedule")
        .update({ day_of_week, opening_time, closing_time })
        .eq("id", id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === "bulk-toggle") {
      const { is_closed } = data

      const { error } = await supabase.from("shop_schedule").update({ is_closed })

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 })
  }
}
