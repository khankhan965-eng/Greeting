import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const client = await createClient();
    const { data, error } = await client
      .from("offers")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[v0] Creating offer with IST timezone data:", {
      title: body.title,
      start_datetime: body.start_datetime,
      end_datetime: body.end_datetime,
      active: body.active,
    });
    
    // Validate required fields
    if (!body.title || !body.description || !body.start_datetime || !body.end_datetime) {
      return NextResponse.json(
        { error: "Title, description, start_datetime, and end_datetime are required" },
        { status: 400 }
      );
    }

    // Verify ISO format with timezone offset
    if (!body.start_datetime.includes("+") && !body.start_datetime.includes("Z")) {
      console.warn(
        "[v0] Warning: start_datetime not in ISO format with timezone:",
        body.start_datetime
      );
    }
    if (!body.end_datetime.includes("+") && !body.end_datetime.includes("Z")) {
      console.warn(
        "[v0] Warning: end_datetime not in ISO format with timezone:",
        body.end_datetime
      );
    }

    const client = await createClient();
    const { data, error } = await client
      .from("offers")
      .insert([body])
      .select();

    console.log("[v0] Insert response - rows affected:", data?.length, "error:", error?.message);

    if (error) {
      console.error("[v0] Database insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Failed to create offer - no data returned" },
        { status: 400 }
      );
    }

    console.log("[v0] Offer created successfully in IST timezone:", {
      id: data[0].id,
      start: data[0].start_datetime,
      end: data[0].end_datetime,
    });
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("[v0] POST /api/offers error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create offer" },
      { status: 500 }
    );
  }
}
