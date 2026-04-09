import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const isAdminRequest = url.searchParams.get("admin") === "true";

    console.log("[v0] GET /api/offers - Admin request:", isAdminRequest);

    // Use admin client for admin requests to bypass RLS, regular client for public
    const client = isAdminRequest ? await createAdminClient() : await createClient();

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
    console.log("[v0] POST /api/offers - Raw request body keys:", Object.keys(body));
    console.log("[v0] POST /api/offers - Full payload:", JSON.stringify(body));
    
    // Validate required fields - strict checking for undefined/null/empty
    const requiredFields = ["title", "description", "start_datetime", "end_datetime"];
    for (const field of requiredFields) {
      const value = body[field];
      
      // Check for undefined, null, empty string, or "undefined" string
      if (value === undefined || value === null || value === "" || value === "undefined" || value === "Invalid Date") {
        console.error(`[v0] Invalid value for field '${field}':`, { 
          value, 
          type: typeof value,
          isUndefinedString: value === "undefined"
        });
        return NextResponse.json(
          { error: `${field} is required and must be a valid value (received: ${value})` },
          { status: 400 }
        );
      }

      // For datetime fields, validate ISO format
      if (field.includes("datetime")) {
        const dateObj = new Date(value);
        if (isNaN(dateObj.getTime())) {
          console.error(`[v0] Invalid ISO datetime for '${field}':`, value);
          return NextResponse.json(
            { error: `${field} must be a valid ISO datetime string` },
            { status: 400 }
          );
        }
      }
    }

    // Verify ISO format with timezone offset or Z
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
    // Filter out any fields that are undefined or null to prevent database errors
    const offerData: Record<string, any> = {};
    
    // Required fields
    const titleTrimmed = String(body.title).trim();
    const descriptionTrimmed = String(body.description).trim();
    
    if (!titleTrimmed) {
      return NextResponse.json(
        { error: "Title cannot be empty after trimming" },
        { status: 400 }
      );
    }
    if (!descriptionTrimmed) {
      return NextResponse.json(
        { error: "Description cannot be empty after trimming" },
        { status: 400 }
      );
    }

    offerData.title = titleTrimmed;
    offerData.description = descriptionTrimmed;
    offerData.start_datetime = body.start_datetime;
    offerData.end_datetime = body.end_datetime;
    
    // Optional fields with defaults
    offerData.frequency = body.frequency ? String(body.frequency).toLowerCase() : "always";
    offerData.show_timer = Boolean(body.show_timer);
    offerData.active = body.active !== undefined ? Boolean(body.active) : true;

    console.log("[v0] Final offer data to insert:", offerData);
    
    // Double-check no undefined values exist
    for (const [key, value] of Object.entries(offerData)) {
      if (value === undefined) {
        console.error("[v0] CRITICAL: Undefined value found in offer data:", key);
        return NextResponse.json(
          { error: `Internal error: ${key} is undefined` },
          { status: 500 }
        );
      }
    }

    // Use admin client to bypass RLS for admin operations
    const client = await createAdminClient();
    const { data, error } = await client
      .from("offers")
      .insert([offerData])
      .select();

    console.log("[v0] Insert response - rows affected:", data?.length, "error:", error?.message);

    if (error) {
      console.error("[v0] Database insert error:", error);
      console.error("[v0] Error details:", {
        code: (error as any).code,
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
      });
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

    console.log("[v0] Offer created successfully:", {
      id: data[0].id,
      title: data[0].title,
      start: data[0].start_datetime,
      end: data[0].end_datetime,
    });
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("[v0] POST /api/offers error:", error);
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "no stack");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create offer" },
      { status: 500 }
    );
  }
}
