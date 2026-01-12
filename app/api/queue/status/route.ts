import { type NextRequest, NextResponse } from "next/server"
import { getSmsQueue } from "@/lib/queue"
import { getUserFromRequest } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const queue = getSmsQueue()

    const counts = await queue.getJobCounts()

    return NextResponse.json({
      success: true,
      queue: {
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
      },
    })
  } catch (error) {
    console.error("[queue/status] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
