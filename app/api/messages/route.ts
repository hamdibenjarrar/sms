import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware"
import { getMessagesByUserId } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const messages = await getMessagesByUserId(user.userId, limit)

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error("[messages] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
