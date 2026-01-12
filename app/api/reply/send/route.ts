import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware"
import { createMessage } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and message are required" }, { status: 400 })
    }

    // Save the reply message to database
    const replyMessage = await createMessage(null, user.userId, phone, message, "outbound")

    // TODO: Send via SMS provider (will be implemented in the queue system)

    return NextResponse.json({
      success: true,
      message: replyMessage,
    })
  } catch (error) {
    console.error("[reply/send] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
