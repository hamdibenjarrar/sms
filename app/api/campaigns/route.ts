import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware"
import { getCampaignsByUserId } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaigns = await getCampaignsByUserId(user.userId)

    return NextResponse.json({
      success: true,
      campaigns,
    })
  } catch (error) {
    console.error("[campaigns] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
