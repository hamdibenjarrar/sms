import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getRedis } from "@/lib/queue"

export async function GET() {
  try {
    const checks: Record<string, any> = {}

    // Check database
    try {
      const dbResult = await db.query("SELECT 1")
      checks.postgres = {
        status: "healthy",
        connected: dbResult && dbResult.length > 0,
      }
    } catch (error) {
      checks.postgres = {
        status: "unhealthy",
        error: error instanceof Error ? error.message : String(error),
      }
    }

    // Check Redis (optional)
    try {
      const redis = await getRedis()
      if (redis) {
        const pong = await redis.ping()
        checks.redis = {
          status: pong === "PONG" ? "healthy" : "unhealthy",
          connected: pong === "PONG",
        }
      } else {
        checks.redis = {
          status: "unavailable",
          note: "Redis not available in this environment",
        }
      }
    } catch (error) {
      checks.redis = {
        status: "unavailable",
        error: error instanceof Error ? error.message : String(error),
      }
    }

    // Overall status: healthy if database is working
    const allHealthy = checks.postgres?.status === "healthy"

    return NextResponse.json(
      {
        status: allHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        checks,
      },
      { status: allHealthy ? 200 : 503 },
    )
  } catch (error) {
    console.error("[health] Error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
