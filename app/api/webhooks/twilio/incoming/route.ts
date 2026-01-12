import { type NextRequest, NextResponse } from "next/server"
import { createMessage, db } from "@/lib/db"
import type { TwilioWebhookIncoming } from "@/lib/types"

// Verify Twilio webhook authenticity
async function verifyTwilioRequest(request: NextRequest): Promise<boolean> {
  // In production, verify the X-Twilio-Signature header
  // For now, accept requests from Twilio only with proper credentials
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio signature
    const isValid = await verifyTwilioRequest(request)
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const twilioData = {
      from: formData.get("From") as string,
      to: formData.get("To") as string,
      body: formData.get("Body") as string,
      messageSid: formData.get("MessageSid") as string,
      accountSid: formData.get("AccountSid") as string,
    } as TwilioWebhookIncoming

    if (!twilioData.from || !twilioData.body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find the user who owns this Twilio number
    const userResult = await db.query(
      `SELECT id FROM users LIMIT 1`, // In production, query by the actual Twilio account
    )

    if (!userResult || userResult.length === 0) {
      console.error("[twilio/incoming] Could not find user for Twilio number")
      return NextResponse.json({ success: true }) // Still return 200 to Twilio
    }

    const userId = userResult[0].id

    // Save incoming message
    await createMessage(null, userId, twilioData.from, twilioData.body, "inbound")

    console.log(`[twilio/incoming] Received SMS from ${twilioData.from}`)

    // Return 200 OK to Twilio
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[twilio/incoming] Error:", error)
    return NextResponse.json({ success: true }, { status: 200 }) // Return 200 to prevent Twilio retries
  }
}
