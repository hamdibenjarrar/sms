/**
 * App initialization - runs once on startup
 * Validates all integrations before the app accepts requests
 */

import { verifyStartup } from "./startup-check"

let initialized = false
let initError: Error | null = null

export async function initializeApp(): Promise<boolean> {
  if (initialized) {
    return initError === null
  }

  try {
    console.log("[app-init] Starting application initialization...")

    const result = await verifyStartup()

    if (!result.success) {
      const errorMsg = `Startup verification failed: ${result.errors.join("; ")}`
      initError = new Error(errorMsg)
      console.error("[app-init] FATAL:", errorMsg)
      return false
    }

    initialized = true
    console.log("[app-init] Application initialized successfully - all systems operational")
    return true
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error))
    console.error("[app-init] Initialization error:", initError.message)
    return false
  }
}

export function isInitialized(): boolean {
  return initialized && initError === null
}

export function getInitError(): Error | null {
  return initError
}
