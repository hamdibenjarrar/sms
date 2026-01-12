/**
 * Environment variable validation
 * Ensures all required variables are present at startup
 */

export interface ValidatedEnv {
  DATABASE_URL: string | undefined
  REDIS_URL: string | undefined
  TEXTLINK_API_KEY: string | undefined
  TEXTLINK_SIM_ID: string | undefined
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
    "TEXTLINK_API_KEY",
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
    TEXTLINK_API_KEY: process.env.TEXTLINK_API_KEY,
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
    TEXTLINK_API_KEY: process.env.TEXTLINK_API_KEY,
    TEXTLINK_SIM_ID: process.env.TEXTLINK_SIM_ID,
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
