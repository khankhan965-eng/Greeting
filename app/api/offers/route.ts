import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const client = createClient();
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
    console.log("[v0] Creating offer with data:", body);
    
    // Validate required fields
    if (!body.title || !body.description || !body.start_datetime || !body.end_datetime) {
      return NextResponse.json(
        { error: "Title, description, start_datetime, and end_datetime are required" },
        { status: 400 }
      );
    }

    const client = createClient();
    const { data, error } = await client
      .from("offers")
      .insert([body])
      .select();

    console.log("[v0] Insert response - data:", data, "error:", error);

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

    console.log("[v0] Offer created successfully:", data[0]);
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("[v0] POST /api/offers error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create offer" },
      { status: 500 }
    );
  }
}
