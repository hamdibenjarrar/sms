import { type NextRequest, NextResponse } from "next/server"
import { getMessageByTwilioSid, updateMessageStatus } from "@/lib/db"
import type { TwilioWebhookStatus } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const twilioData = {
      status: formData.get("SmsStatus") as string,
      messageSid: formData.get("MessageSid") as string,
      accountSid: formData.get("AccountSid") as string,
    } as TwilioWebhookStatus

    if (!twilioData.messageSid || !twilioData.status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find the message in our database
    const message = await getMessageByTwilioSid(twilioData.messageSid)

    if (!message) {
      console.warn(`[twilio/status] Message not found: ${twilioData.messageSid}`)
      return NextResponse.json({ success: true }) // Return 200 to prevent retries
    }

    // Map Twilio status to our status
    const statusMap: Record<string, string> = {
      queued: "queued",
      sending: "sent",
      sent: "sent",
      delivered: "delivered",
      undelivered: "failed",
      failed: "failed",
    }

    const newStatus = statusMap[twilioData.status.toLowerCase()] || twilioData.status

    // Update message status
    await updateMessageStatus(message.id, newStatus)

    console.log(`[twilio/status] Updated message ${twilioData.messageSid} to ${newStatus}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[twilio/status] Error:", error)
    return NextResponse.json({ success: true }, { status: 200 }) // Return 200 to prevent Twilio retries
  }
}
