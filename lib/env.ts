/**
 * Environment variable validation
 * Ensures all required variables are present at startup
 */

export interface ValidatedEnv {
  DATABASE_URL: string | undefined
  REDIS_URL: string | undefined
  TWILIO_ACCOUNT_SID: string | undefined
  TWILIO_AUTH_TOKEN: string | undefined
  TWILIO_PHONE_NUMBER: string | undefined
  JWT_SECRET: string
  NODE_ENV: string
  PORT: string
}

/**
 * Validate all required environment variables
 * Throws error if any are missing
 */
export function validateEnv(): ValidatedEnv {
  const required = [
    "DATABASE_URL",
    "REDIS_URL",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "JWT_SECRET",
  ]

  const missing: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(", ")}`)
    console.error("[env-validation] FATAL:", error.message)
    throw error
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    JWT_SECRET: process.env.JWT_SECRET!,
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "3000",
  }
}

/**
 * Get environment variables (soft fail for preview)
 */
export function getEnv(): ValidatedEnv {
  // JWT_SECRET is required for auth
  const jwtSecret = process.env.JWT_SECRET || "dev-secret-key-change-in-production"

  return {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    JWT_SECRET: jwtSecret,
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "3000",
  }
}

export function checkRequiredEnv(required: string[]): boolean {
  const env = getEnv()
  const missing = required.filter((key) => !env[key as keyof ValidatedEnv])
  return missing.length === 0
}
