import { NextRequest, NextResponse } from "next/server"

// In-memory storage for FCM tokens (replace with database in production)
const fcmTokens = new Set<string>()

/**
 * POST /api/fcm-tokens
 * Save FCM token for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userEmail } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    console.log("[v0] Received FCM token:", token, "for user:", userEmail)

    // Store token in memory (in production, save to database)
    fcmTokens.add(token)

    // TODO: Save token to database with user info
    // Example:
    // await db.collection("fcm_tokens").insert({
    //   token,
    //   userEmail: userEmail || "anonymous",
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // })

    return NextResponse.json({
      success: true,
      message: "FCM token saved successfully",
      tokenCount: fcmTokens.size,
    })
  } catch (error) {
    console.error("[v0] Error saving FCM token:", error)
    return NextResponse.json(
      { error: "Failed to save FCM token" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/fcm-tokens
 * Get all registered FCM tokens
 */
export async function GET() {
  try {
    const tokens = Array.from(fcmTokens)

    console.log("[v0] Retrieving FCM tokens, count:", tokens.length)

    return NextResponse.json({
      tokens,
      count: tokens.length,
    })
  } catch (error) {
    console.error("[v0] Error retrieving FCM tokens:", error)
    return NextResponse.json(
      { error: "Failed to retrieve FCM tokens" },
      { status: 500 }
    )
  }
}
