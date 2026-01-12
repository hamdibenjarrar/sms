import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail, password: rawPassword } = await request.json()

    if (!rawEmail || !rawPassword) {
      console.log("[auth/login] Missing fields")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const email = rawEmail.trim()
    const password = rawPassword.trim()

    console.log(`[auth/login] Attempting login for: '${email}'`)

    const user = await getUserByEmail(email)

    if (!user) {
      console.log(`[auth/login] User not found: ${email}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      console.log(`[auth/login] Password invalid for user: ${email}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
    })

    return response
  } catch (error) {
    console.error("[auth/login] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
