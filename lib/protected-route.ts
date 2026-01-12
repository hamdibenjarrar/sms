import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "./middleware"

export async function withAuth(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(request)
  }
}
