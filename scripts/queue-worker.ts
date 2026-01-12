/**
 * Standalone queue worker for production
 * Run this separately: node -r ts-node/register scripts/queue-worker.ts
 * Or add to package.json: "worker": "ts-node scripts/queue-worker.ts"
 */

import 'dotenv/config'
import { initializeWorker } from "@/lib/queue"

async function main() {
  console.log("[queue-worker] Starting SMS queue worker...")

  try {
    const worker = await initializeWorker()
    console.log("[queue-worker] Worker initialized and listening for jobs")

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("[queue-worker] SIGTERM received, shutting down gracefully...")
      await worker.close()
      process.exit(0)
    })

    process.on("SIGINT", async () => {
      console.log("[queue-worker] SIGINT received, shutting down gracefully...")
      await worker.close()
      process.exit(0)
    })
  } catch (error) {
    console.error("[queue-worker] Fatal error:", error)
    process.exit(1)
  }
}

main()
