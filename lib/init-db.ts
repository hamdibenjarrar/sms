/**
 * Initialize database with seed data
 * Run once at startup
 */
import { db } from "./db"

export async function initializeDatabase() {
  try {
    // Check if users table exists
    const result = await db.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )`,
    )

    if (!result[0].exists) {
      console.log("[init-db] Tables do not exist. Please run migrations first.")
      return false
    }

    // Check if demo user exists
    const userResult = await db.query("SELECT id FROM users WHERE email = $1", ["admin@example.com"])

    if (userResult.length === 0) {
      // Create demo user with hashed password
      // Using a simple hash for demo purposes - in production, use proper password hashing
      const demoHash = "demo-hash-replace-in-production"
      await db.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING",
        ["admin@example.com", demoHash, "admin"],
      )
      console.log("[init-db] Demo user created: admin@example.com")
    }

    console.log("[init-db] Database initialized successfully")
    return true
  } catch (error) {
    console.error("[init-db] Error initializing database:", error)
    return false
  }
}
