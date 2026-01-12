/**
 * Startup verification endpoint
 * Validates all integrations: PostgreSQL, Redis, SMS Provider
 * Returns detailed status for debugging
 */
import { NextResponse } from "next/server"
import { verifyStartup } from "@/lib/startup-check"

export async function GET() {
  try {
    const result = await verifyStartup()

    if (result.success) {
      return NextResponse.json(
        {
          status: "ready",
          message: "All systems operational",
          checks: result.checks,
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        {
          status: "failed",
          message: "Some systems are not available",
          checks: result.checks,
          errors: result.errors,
        },
        { status: 503 },
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[startup/check] Unexpected error:", errorMessage)

    return NextResponse.json(
      {
        status: "error",
        message: "Startup check failed",
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
