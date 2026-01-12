import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/middleware"
import { getPhoneNumbers } from "@/lib/twilio"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const numbers = await getPhoneNumbers()

    return NextResponse.json({
      success: true,
      numbers: numbers.map((num: any) => ({
        sid: num.sid,
        phone: num.phoneNumber,
        friendlyName: num.friendlyName,
      })),
    })
  } catch (error) {
    console.error("[twilio/numbers] Error:", error)
    return NextResponse.json({ error: "Failed to fetch phone numbers" }, { status: 500 })
  }
}
