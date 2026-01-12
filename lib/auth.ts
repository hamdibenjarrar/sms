import * as crypto from "crypto"
import * as jwt from "jsonwebtoken"
import { getEnv } from "./env"
import type { AuthPayload } from "./types"

const SALT_ROUNDS = 10

export function getJwtSecret(): string {
  const env = getEnv()
  return env.JWT_SECRET
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, storedHash] = hash.split(":")
    if (!salt || !storedHash) return false
    
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
    return computedHash === storedHash
  } catch (error) {
    console.error("[auth] Password verification error:", error)
    return false
  }
}

export function generateToken(payload: AuthPayload): string {
  const secret = getJwtSecret()
  return jwt.sign(payload, secret, { expiresIn: "24h" })
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const secret = getJwtSecret()
    return jwt.verify(token, secret) as AuthPayload
  } catch (error) {
    console.error("[auth] Token verification failed:", error instanceof Error ? error.message : error)
    return null
  }
}

export function decodeToken(token: string): AuthPayload | null {
  try {
    return jwt.decode(token) as AuthPayload
  } catch (error) {
    console.error("[auth] Token decode failed:", error)
    return null
  }
}
