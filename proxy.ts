import { type NextRequest, NextResponse } from "next/server"
import { initializeWorker } from "@/lib/queue"

// Initialize queue worker on first request
let workerInitialized = false

export async function proxy(request: NextRequest) {
  // Initialize worker once
  if (!workerInitialized) {
    try {
      await initializeWorker()
      workerInitialized = true
      console.log("[middleware] Queue worker initialized")
    } catch (error) {
      console.error("[middleware] Failed to initialize queue worker:", error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
