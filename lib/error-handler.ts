export class SMSError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 400,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = "SMSError"
  }
}

export const ErrorCodes = {
  INVALID_PHONE: "INVALID_PHONE",
  SMS_PROVIDER_ERROR: "SMS_PROVIDER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  QUEUE_ERROR: "QUEUE_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  RATE_LIMIT: "RATE_LIMIT",
}

export function handleError(error: unknown): { message: string; code: string; statusCode: number } {
  if (error instanceof SMSError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    console.error("[error-handler] Unhandled error:", error)
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    }
  }

  return {
    message: "An unknown error occurred",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  }
}
