import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware"
import { createCampaign, createMessage } from "@/lib/db"
// import { queueSmsMessage } from "@/lib/queue" // Queues don't work well on Serverless Vercel
import { processMessage } from "@/lib/sms-sender" // Direct send for Vercel
import type { SendSmsRequest } from "@/lib/types"

import { normalizePhoneNumber } from "@/lib/sms-utils"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as SendSmsRequest

    if (!body.campaignName || !body.messageTemplate || !body.recipients || body.recipients.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const campaign = await createCampaign(user.userId, body.campaignName, body.messageTemplate, body.recipients.length)

    // Create messages and queue them
    const messageIds: number[] = []
    for (const recipient of body.recipients) {
      // Normalize phone number to ensure E.164 format (e.g. +1234567890)
      const normalizedPhone = normalizePhoneNumber(recipient.phone)
      
      const message = await createMessage(campaign.id, user.userId, normalizedPhone, body.messageTemplate, "outbound")
      messageIds.push(message.id)

      // Vercel compatible: Send immediately (Serverless functions shouldn't rely on background workers)
      try {
        // await queueSmsMessage(message.id)
        await processMessage(message.id)
      } catch (sendError) {
        console.error(`[sms/send] Failed to send message ${message.id}:`, sendError)
        // Continue with other messages
      }
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        totalMessages: campaign.total_messages,
        status: campaign.status,
      },
      messageCount: messageIds.length,
      queuedMessages: messageIds.length,
    })
  } catch (error) {
    console.error("[sms/send] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
