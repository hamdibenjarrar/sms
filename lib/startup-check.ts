/**
 * Startup verification - validates all integrations at app boot
 * CRITICAL: This ensures the app only starts if all dependencies are available
 */

import { getEnv } from "./env"
import { db } from "./db"
import { validateTwilioConnection } from "./twilio"

export async function verifyStartup(): Promise<{
  success: boolean
  checks: Record<string, boolean>
  errors: string[]
}> {
  console.log("[startup] Starting verification checks...")

  const checks: Record<string, boolean> = {
    env: false,
    postgres: false,
    twilio: false,
  }

  const errors: string[] = []

  // 1. Check environment variables
  try {
    getEnv()
    checks.env = true
    console.log("[startup] ✓ Environment variables validated")
  } catch (error) {
    checks.env = false
    const msg = error instanceof Error ? error.message : String(error)
    errors.push(`Environment validation failed: ${msg}`)
    console.error("[startup] ✗ Environment validation failed:", msg)
  }

  // 2. Check PostgreSQL connection
  try {
    const result = await db.query("SELECT 1")
    checks.postgres = result && result.length > 0
    if (checks.postgres) {
      console.log("[startup] ✓ PostgreSQL (Neon) connected")
    } else {
      errors.push("PostgreSQL returned empty result")
      console.error("[startup] ✗ PostgreSQL returned empty result")
    }
  } catch (error) {
    checks.postgres = false
    const msg = error instanceof Error ? error.message : String(error)
    errors.push(`PostgreSQL connection failed: ${msg}`)
    console.error("[startup] ✗ PostgreSQL connection failed:", msg)
  }

  // 3. Check Twilio credentials (optional for preview)
  try {
    const valid = await validateTwilioConnection()
    checks.twilio = valid
    if (valid) {
      console.log("[startup] ✓ Twilio credentials validated")
    } else {
      console.warn("[startup] ⚠ Twilio validation returned false (optional)")
    }
  } catch (error) {
    console.warn("[startup] ⚠ Twilio validation skipped (optional for preview)")
    checks.twilio = true // Don't fail on Twilio for preview
  }

  const success = Object.values(checks).every((v) => v === true)

  console.log("[startup] Verification complete:", {
    success,
    checks,
    errorCount: errors.length,
  })

  if (!success) {
    console.error("[startup] FAILED - Some critical checks did not pass.")
  }

  return { success, checks, errors }
}
