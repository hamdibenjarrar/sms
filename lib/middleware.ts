import type { NextRequest } from "next/server"
import { decodeToken } from "./auth"
import type { AuthPayload } from "./types"

export async function getUserFromRequest(request: NextRequest): Promise<AuthPayload | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    let token = authHeader?.replace("Bearer ", "")

    // Fallback to cookie if no Authorization header
    if (!token) {
      token = request.cookies.get("auth-token")?.value
    }

    if (!token) {
      return null
    }

    const payload = decodeToken(token)
    return payload
  } catch {
    return null
  }
}
