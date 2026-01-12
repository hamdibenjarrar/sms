import twilio from "twilio"
import { getEnv } from "./env"

let client: ReturnType<typeof twilio.Twilio> | null = null

function getTwilioClient() {
  if (!client) {
    const env = getEnv()

    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      throw new Error("Missing Twilio credentials in environment variables")
    }

    client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    console.log("[twilio] Client initialized with account:", env.TWILIO_ACCOUNT_SID.substring(0, 4) + "...")
  }

  return client
}

export async function sendSms(toPhone: string, message: string) {
  try {
    const client = getTwilioClient()
    const env = getEnv()

    if (!toPhone || !message) {
      throw new Error("toPhone and message are required")
    }

    const result = await client.messages.create({
      from: env.TWILIO_PHONE_NUMBER,
      to: toPhone,
      body: message,
    })

    console.log(`[twilio] SMS sent to ${toPhone} with SID ${result.sid}`)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[twilio] Error sending SMS to ${toPhone}:`, errorMessage)
    throw error
  }
}

export async function getPhoneNumbers() {
  try {
    const client = getTwilioClient()
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list()
    console.log(`[twilio] Retrieved ${incomingPhoneNumbers.length} phone numbers`)
    return incomingPhoneNumbers
  } catch (error) {
    console.error("[twilio] Error fetching phone numbers:", error)
    throw error
  }
}

export async function validateTwilioConnection(): Promise<boolean> {
  try {
    await getPhoneNumbers()
    console.log("[twilio] Connection validation successful")
    return true
  } catch (error) {
    console.error("[twilio] Connection validation failed:", error)
    return false
  }
}

export function getTwilioAccountSid() {
  const env = getEnv()
  return env.TWILIO_ACCOUNT_SID
}

export function getTwilioPhoneNumber() {
  const env = getEnv()
  return env.TWILIO_PHONE_NUMBER
}
