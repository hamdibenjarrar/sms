import { neon } from "@neondatabase/serverless"
import { getEnv } from "./env"

let sql: ReturnType<typeof neon> | null = null
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 3

function getDb() {
  if (!sql) {
    const env = getEnv()
    if (!env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    if (env.DATABASE_URL.includes("place:holder")) {
      const msg = "\n\n🔴 CRITICAL ERROR: You have not updated your .env file!\n" +
                  "Please open .env and replace 'postgresql://place:holder...' with your REAL Neon connection string.\n" +
                  "Get it from: https://console.neon.tech\n\n"
      console.error(msg)
      throw new Error(msg)
    }
    sql = neon(env.DATABASE_URL)
  }
  return sql
}

async function testConnection() {
  try {
    const client = getDb()
    // @ts-ignore - The neon driver exports a callable that also has a .query() method for non-tagged usage
    const result = await client.query("SELECT 1")
    console.log("[db] Connection test successful")
    return true
  } catch (error) {
    connectionAttempts++
    console.warn(
      `[db] Connection test failed (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`,
      error instanceof Error ? error.message : error,
    )
    // Don't throw - allow app to run even without DB connection
    return false
  }
}

if (typeof window === "undefined") {
  testConnection().catch((error) => {
    console.warn(
      "[db] Database connection unavailable (may be normal in preview):",
      error instanceof Error ? error.message : error,
    )
    // Don't exit - allow preview to work without database
  })
}

export const db = {
  query: async (text: string, params?: any[]) => {
    const sql = getDb()
    try {
      // @ts-ignore - The neon driver exports a callable that also has a .query() method for non-tagged usage
      const result = await sql.query(text, params)
      return result as any[]
    } catch (error) {
      console.error("[db] Query error:", error instanceof Error ? error.message : error)
      throw error
    }
  },
}

// Helper functions for common queries
export async function createUser(email: string, passwordHash: string, role = "admin") {
  const result = await db.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at",
    [email, passwordHash, role],
  )
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await db.query("SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1", [
    email,
  ])
  return result[0]
}

export async function getUserById(id: number) {
  const result = await db.query("SELECT id, email, role, created_at FROM users WHERE id = $1", [id])
  return result[0]
}

export async function createCampaign(userId: number, name: string, messageTemplate: string, totalMessages: number) {
  const result = await db.query(
    "INSERT INTO campaigns (user_id, name, message_template, total_messages, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [userId, name, messageTemplate, totalMessages, "draft"],
  )
  return result[0]
}

export async function getCampaignsByUserId(userId: number) {
  const result = await db.query("SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC", [userId])
  return result
}

export async function getCampaignById(id: number) {
  const result = await db.query("SELECT * FROM campaigns WHERE id = $1", [id])
  return result[0]
}

export async function createMessage(
  campaignId: number | null,
  userId: number,
  phone: string,
  body: string,
  direction = "outbound",
) {
  const result = await db.query(
    "INSERT INTO messages (campaign_id, user_id, phone, body, direction, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [campaignId, userId, phone, body, direction, "queued"],
  )
  return result[0]
}

export async function getMessagesByUserId(userId: number, limit = 50) {
  const result = await db.query("SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2", [
    userId,
    limit,
  ])
  return result
}

export async function getConversationsByUserId(userId: number) {
  const result = await db.query(
    "SELECT DISTINCT ON (phone) * FROM messages WHERE user_id = $1 ORDER BY phone, created_at DESC",
    [userId],
  )
  return result
}

export async function getMessagesByPhone(userId: number, phone: string) {
  const result = await db.query("SELECT * FROM messages WHERE user_id = $1 AND phone = $2 ORDER BY created_at ASC", [
    userId,
    phone,
  ])
  return result
}

export async function updateMessageStatus(messageId: number, status: string, error?: string) {
  const query = error
    ? "UPDATE messages SET status = $1, error = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *"
    : "UPDATE messages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *"

  const params = error ? [status, error, messageId] : [status, messageId]
  const result = await db.query(query, params)
  return result[0]
}

export async function updateMessageWithProviderId(messageId: number, providerId: string) {
  // Note: Ensure migration scripts/003-migrate-twilio-to-provider.sql is run
  const result = await db.query(
    "UPDATE messages SET provider_sid = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [providerId, messageId],
  )
  return result[0]
}

export async function getMessageByProviderId(providerId: string) {
  const result = await db.query("SELECT * FROM messages WHERE provider_sid = $1", [providerId])
  return result[0]
}
