import { sendSmsSimple } from "./sms-verify"
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

    // Send SMS via RapidAPI (SMS Verify)
    // Note: SMS Verify generates its own code. The 'body' from database might be ignored by the API.
    const result = await sendSmsSimple(message.phone, message.body)
    
    if (!result.success) {
       console.error("[sms-sender] Provider failure:", result.error);
       throw new Error(`Provider failure: ${result.error}`);
    }

    // Mock Provider ID or extract if available
    const providerId = result.data?.verify_code || `RAPID-${Date.now()}`;
    
    await updateMessageWithProviderId(messageId, providerId)

    // Update status to sent
    await updateMessageStatus(messageId, "sent")

    console.log(`[sms-sender] Successfully sent message ${messageId} (Verify Code: ${result.data?.verify_code})`)
  } catch (error) {
    console.error(`[sms-sender] Error processing message ${messageId}:`, error)

    // Update message status to failed with error details
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await updateMessageStatus(messageId, "failed", errorMessage)
  }
}
