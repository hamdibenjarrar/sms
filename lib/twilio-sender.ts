import { sendSms } from "./twilio"
import { updateMessageStatus, updateMessageWithTwilioSid, db } from "./db"

export async function processMessage(messageId: number): Promise<void> {
  try {
    // Fetch message from database
    const messageResult = await db.query("SELECT * FROM messages WHERE id = $1", [messageId])

    if (!messageResult || messageResult.length === 0) {
      throw new Error(`Message not found: ${messageId}`)
    }

    const message = messageResult[0]

    if (message.status !== "queued") {
      console.warn(`[twilio-sender] Message ${messageId} is not in queued status`)
      return
    }

    // Send SMS via Twilio
    const result = await sendSms(message.phone, message.body)

    // Update message with Twilio SID
    await updateMessageWithTwilioSid(messageId, result.sid)

    // Update status to sent
    await updateMessageStatus(messageId, "sent")

    console.log(`[twilio-sender] Successfully sent message ${messageId} with SID ${result.sid}`)
  } catch (error) {
    console.error(`[twilio-sender] Error processing message ${messageId}:`, error)

    // Update message status to failed with error details
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await updateMessageStatus(messageId, "failed", errorMessage)
  }
}
