export interface User {
  id: number
  email: string
  role: string
  created_at: string
}

export interface Campaign {
  id: number
  user_id: number
  name: string
  message_template: string
  total_messages: number
  status: "draft" | "sent" | "sending"
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  campaign_id: number | null
  user_id: number
  phone: string
  direction: "outbound" | "inbound"
  body: string
  status: "queued" | "sent" | "delivered" | "failed"
  twilio_sid: string | null
  error: string | null
  created_at: string
  updated_at: string
}

export interface AuthPayload {
  userId: number
  email: string
}

export interface SendSmsRequest {
  campaignName: string
  messageTemplate: string
  recipients: Array<{
    phone: string
    name?: string
    variables?: Record<string, string>
  }>
}

