import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware"
import { getMessagesByPhone, db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get distinct conversations grouped by phone number
    const result = await db.query(
      `SELECT DISTINCT ON (phone) phone, 
       MAX(created_at) as last_message_at
       FROM messages 
       WHERE user_id = $1 
       GROUP BY phone 
       ORDER BY phone, MAX(created_at) DESC`,
      [user.userId],
    )

    const conversations = result.map((row: any) => ({
      phone: row.phone,
      lastMessageAt: row.last_message_at,
    }))

    return NextResponse.json({
      success: true,
      conversations,
    })
  } catch (error) {
    console.error("[conversations] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET_PHONE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const messages = await getMessagesByPhone(user.userId, phone)

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error("[conversations/phone] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
