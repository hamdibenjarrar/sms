import { sendSms } from "./textlink"
import { updateMessageStatus, updateMessageWithProviderId, db } from "./db"

export async function processMessage(messageId: number): Promise<void> {
  try {
    // Fetch message from database
    const messageResult = await db.query("SELECT * FROM messages WHERE id = $1", [messageId])

    if (!messageResult || messageResult.length === 0) {
      throw new Error(`Message not found: ${messageId}`)
    }

    const message = messageResult[0]

    if (message.status !== "queued") {
      console.warn(`[sms-sender] Message ${messageId} is not in queued status`)
      return
    }

    // Send SMS via TextLink
    const result = await sendSms(message.phone, message.body)
    
    // TextLink result is { ok: true }
    if (!result || !result.ok) {
       console.error("[sms-sender] TextLink failure payload:", result);
       throw new Error(`TextLink API failure: ${JSON.stringify(result)}`);
    }

    // Update message with Provider ID (TextLink doesn't seem to return ID in success response)
    // We'll generate a placeholder ID or use timestamp
    const providerId = result.id || result.message_id || `TL-${Date.now()}`;
    
    await updateMessageWithProviderId(messageId, providerId)

    // Update status to sent
    await updateMessageStatus(messageId, "sent")

    console.log(`[sms-sender] Successfully sent message ${messageId}`)
  } catch (error) {
    console.error(`[sms-sender] Error processing message ${messageId}:`, error)

    // Update message status to failed with error details
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await updateMessageStatus(messageId, "failed", errorMessage)
  }
}
