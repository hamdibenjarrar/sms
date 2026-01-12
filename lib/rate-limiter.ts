import { Redis } from "ioredis"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<boolean> {
  const current = await redis.incr(key)

  if (current === 1) {
    // First request in the window, set expiration
    await redis.expire(key, Math.ceil(options.windowMs / 1000))
  }

  return current <= options.maxRequests
}

export async function getRateLimitStatus(
  key: string,
  options: RateLimitOptions,
): Promise<{ current: number; limit: number; resetTime: number }> {
  const current = Number.parseInt((await redis.get(key)) || "0")
  const ttl = await redis.ttl(key)

  return {
    current,
    limit: options.maxRequests,
    resetTime: ttl > 0 ? ttl * 1000 : 0,
  }
}
