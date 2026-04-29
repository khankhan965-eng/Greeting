import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const client = await createClient();
    const { data, error } = await client
      .from("offers")
      .select("*")
      .eq("id", resolvedParams.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch offer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    console.log("[v0] PUT /api/offers/[id] - updating offer:", resolvedParams.id);
    console.log("[v0] Update body:", body);
    
    // Use admin client to bypass RLS
    const client = await createAdminClient();

    const { data, error } = await client
      .from("offers")
      .update(body)
      .eq("id", resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error("[v0] Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("[v0] Offer updated successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("[v0] DELETE /api/offers/[id] - deleting offer:", resolvedParams.id);
    
    // Use admin client to bypass RLS
    const client = await createAdminClient();
    const { error } = await client
      .from("offers")
      .delete()
      .eq("id", resolvedParams.id);

    if (error) {
      console.error("[v0] Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("[v0] Offer deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}
