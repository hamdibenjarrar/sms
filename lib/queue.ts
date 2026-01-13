// This prevents errors in preview/browser environment
"use server"

import { Queue, Worker } from "bullmq"
import { getEnv } from "./env"
import { processMessage } from "./sms-sender"

let redis: any = null
let smsQueue: Queue | null = null
let worker: Worker | null = null
let connectionError: Error | null = null

export async function getRedis(): Promise<any> {
  // Return null in preview/browser environment
  if (typeof window !== "undefined") {
    return null
  }

  if (!redis) {
    try {
      const env = getEnv()
      const redisUrl = env.REDIS_URL

      if (!redisUrl) {
        console.warn("[redis] REDIS_URL not configured, queue operations will fail")
        return null
      }

      // Dynamically import ioredis only on server
      try {
        const { default: Redis } = await import("ioredis")
        // BullMQ/IORedis sometimes hiccups on 'rediss://' in serverless or behind NAT.
        // For Upstash, strict TLS with family: 6 often fails locally on Node 18+.
        // Let's ensure family: 0 (IPv4/IPv6 auto) and rejectUnauthorized: false if needed.
        redis = new Redis(redisUrl, {
          family: 0,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000)
            return delay
          },
          keepAlive: 10000,
        })

        redis.on("error", (error: Error) => {
          console.warn("[redis] Connection error:", error.message)
          connectionError = error
        })

        redis.on("connect", () => {
          console.log("[redis] Connected successfully")
          connectionError = null
        })
      } catch (importError) {
        console.warn("[redis] ioredis not available, queue disabled")
        return null
      }
    } catch (error) {
      console.warn("[redis] Failed to create connection:", error instanceof Error ? error.message : error)
      return null
    }
  }

  return redis
}

export async function getSmsQueue(): Promise<Queue | null> {
  try {
    if (!smsQueue) {
      const redisConnection = await getRedis()
      if (!redisConnection) return null
      smsQueue = new Queue("sms-send", {
        connection: redisConnection,
      })
    }
    return smsQueue
  } catch (error) {
    console.error("[queue] Error getting queue:", error)
    return null
  }
}

export async function initializeWorker() {
  try {
    if (worker) {
      return worker
    }

    const queue = await getSmsQueue()
    if (!queue) return null

    const redisConnection = await getRedis()
    if (!redisConnection) return null

    worker = new Worker(
      "sms-send",
      async (job) => {
        console.log(`[queue-worker] Processing job ${job.id}:`, job.data)

        try {
          const { messageId } = job.data

          // Process the message
          await processMessage(messageId)

          return { success: true, messageId }
        } catch (error) {
          console.error(`[queue-worker] Error processing job ${job.id}:`, error)
          throw error
        }
      },
      {
        connection: redisConnection,
        concurrency: 5,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
    )

    worker.on("completed", (job) => {
      console.log(`[queue-worker] Job ${job.id} completed`)
    })

    worker.on("failed", (job, err) => {
      console.error(`[queue-worker] Job ${job?.id} failed:`, err.message)
    })

    worker.on("error", (err) => {
      console.error(`[queue-worker] Worker error:`, err)
    })

    return worker
  } catch (error) {
    console.error("[queue] Error initializing worker:", error)
    return null
  }
}

export async function queueSmsMessage(messageId: number) {
  try {
    const redis = await getRedis()
    if (!redis) {
      console.log(`[queue] Redis unavailable for message ${messageId}, marking as sent`)
      // In preview, just return success without actually queuing
      return null
    }
    const queue = await getSmsQueue()
    if (!queue) {
      console.warn("[queue] Queue not available, processing message synchronously")
      await processMessage(messageId)
      return null
    }

    const job = await queue.add(
      "send-sms",
      { messageId },
      {
        jobId: `sms-${messageId}`,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        priority: 1,
      },
    )

    console.log(`[queue] Queued SMS message ${messageId} with job ID ${job.id}`)
    return job
  } catch (error) {
    console.warn(`[queue] Error queuing message ${messageId}:`, error)
    // Fallback to synchronous processing if queue fails
    await processMessage(messageId)
    return null
  }
}

export async function cleanupQueue() {
  if (worker) {
    try {
      await worker.close()
    } catch (error) {
      console.warn("[queue] Error during cleanup:", error)
    }
  }
  if (smsQueue) {
    try {
      await smsQueue.close()
    } catch (error) {
      console.warn("[queue] Error during cleanup:", error)
    }
  }
  if (redis) {
    try {
      await redis.quit()
    } catch (error) {
      console.warn("[queue] Error during cleanup:", error)
    }
  }
}
