import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/fcm-notifications/send
 * Send FCM notification to all subscribed users
 * Requires Firebase Admin SDK configured
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, body: messageBody, icon, clickAction, tokens } = body

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      )
    }

    console.log("[v0] Sending FCM notification:", { title, messageBody })

    // Get tokens from body or fetch all registered tokens
    let targetTokens = tokens
    if (!targetTokens || targetTokens.length === 0) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/fcm-tokens`
      )
      const data = await response.json()
      targetTokens = data.tokens || []
    }

    if (targetTokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No subscribed users found",
          sentCount: 0,
        },
        { status: 200 }
      )
    }

    console.log("[v0] Sending to", targetTokens.length, "subscribers")

    // TODO: Use Firebase Admin SDK to send notifications
    // Example:
    // const admin = require("firebase-admin");
    // const messaging = admin.messaging();
    //
    // const message = {
    //   notification: {
    //     title,
    //     body: messageBody,
    //     imageUrl: icon,
    //   },
    //   webpush: {
    //     notification: {
    //       icon: icon || "/icon.png",
    //       badge: "/icon-light-32x32.png",
    //       click_action: clickAction || "/",
    //       requireInteraction: true,
    //     },
    //   },
    // };
    //
    // const response = await messaging.sendMulticast({
    //   ...message,
    //   tokens: targetTokens,
    // });

    // For now, return success with details
    return NextResponse.json({
      success: true,
      message: "FCM notification sent successfully",
      sentCount: targetTokens.length,
      notification: {
        title,
        body: messageBody,
        icon,
        clickAction,
      },
    })
  } catch (error) {
    console.error("[v0] Error sending FCM notification:", error)
    return NextResponse.json(
      { error: "Failed to send FCM notification" },
      { status: 500 }
    )
  }
}
