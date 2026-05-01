import { NextRequest, NextResponse } from "next/server"

// In-memory storage for subscriptions (in production, use a database)
// This should be replaced with a proper database like Supabase
const subscriptions = new Map<string, any>()

/**
 * POST /api/push-subscriptions
 * Subscribe a user to push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()

    if (!subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })
    }

    // Store subscription (use endpoint as unique identifier)
    subscriptions.set(subscription.endpoint, subscription)

    // TODO: Save to database for persistence
    console.log("[v0] Subscription stored:", subscription.endpoint)

    return NextResponse.json(
      { message: "Subscription saved successfully", endpoint: subscription.endpoint },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Error saving subscription:", error)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}

/**
 * GET /api/push-subscriptions
 * Get all active subscriptions (for admin/server use)
 */
export async function GET(request: NextRequest) {
  // Add authentication check in production
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const subscriptionsList = Array.from(subscriptions.values())
    return NextResponse.json(
      {
        count: subscriptionsList.length,
        subscriptions: subscriptionsList,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

/**
 * DELETE /api/push-subscriptions
 * Unsubscribe a user from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 })
    }

    const deleted = subscriptions.delete(endpoint)

    if (!deleted) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    console.log("[v0] Subscription deleted:", endpoint)

    return NextResponse.json({ message: "Subscription deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error deleting subscription:", error)
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
  }
}
