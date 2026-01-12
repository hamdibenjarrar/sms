import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware"
import { getMessagesByPhone } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ phone: string }> }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phone } = await params

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const messages = await getMessagesByPhone(user.userId, decodeURIComponent(phone))

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error("[conversations/phone] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
