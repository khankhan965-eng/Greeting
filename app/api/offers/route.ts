import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const client = await createClient();
    const url = new URL(request.url);
    const isAdminRequest = url.searchParams.get("admin") === "true";

    console.log("[v0] GET /api/offers - Admin request:", isAdminRequest);

    const query = client
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    // For public API: only show active offers
    // For admin API: show all offers
    if (!isAdminRequest) {
      query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Database error fetching offers:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("[v0] Offers fetched:", data?.length || 0, "isAdmin:", isAdminRequest);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("[v0] GET /api/offers error:", error);
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
    
    // Validate required fields - ensure no undefined values
    const requiredFields = ["title", "description", "start_datetime", "end_datetime"];
    for (const field of requiredFields) {
      if (!body[field] || body[field] === undefined || body[field] === "") {
        console.error(`[v0] Missing required field: ${field}`, { value: body[field] });
        return NextResponse.json(
          { error: `${field} is required and cannot be empty` },
          { status: 400 }
        );
      }
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

    // Prepare offer data - only include fields expected by database
    const offerData = {
      title: String(body.title).trim(),
      description: String(body.description).trim(),
      start_datetime: body.start_datetime,
      end_datetime: body.end_datetime,
      frequency: body.frequency || "always",
      show_timer: Boolean(body.show_timer),
      active: Boolean(body.active ?? true),
    };

    console.log("[v0] Prepared offer data:", offerData);

    const client = await createClient();
    const { data, error } = await client
      .from("offers")
      .insert([offerData])
      .select();

    console.log("[v0] Insert response - rows affected:", data?.length, "error:", error?.message);

    if (error) {
      console.error("[v0] Database insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create offer in database" },
        { status: 400 }
      );
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
