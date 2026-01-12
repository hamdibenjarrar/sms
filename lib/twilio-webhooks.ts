import * as crypto from "crypto"

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || ""

export function verifyTwilioSignature(url: string, params: Record<string, string>, signature: string): boolean {
  // Construct the signed content
  let data = url

  // Sort parameters and append to URL
  const sortedParams = Object.keys(params).sort()
  for (const key of sortedParams) {
    data += key + params[key]
  }

  // Compute HMAC-SHA1
  const computed = crypto.createHmac("sha1", TWILIO_AUTH_TOKEN).update(data).digest("Base64")

  // Compare signatures
  return computed === signature
}
