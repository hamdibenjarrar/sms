// SMS character counting and segmentation logic
export function calculateSmsSegments(text: string): number {
  // Standard SMS: 160 chars = 1 segment
  // Unicode SMS: 70 chars = 1 segment
  const isUnicode = /[^\x00-\x7F]/.test(text)
  const segmentSize = isUnicode ? 70 : 160
  const segments = Math.ceil(text.length / segmentSize)
  return Math.max(1, segments)
}

export function validatePhoneNumber(phone: string): boolean {
  // Simple E.164 validation
  const e164Regex = /^\+?[1-9]\d{1,14}$/
  return e164Regex.test(phone)
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, "")

  // Ensure it starts with +
  if (!normalized.startsWith("+")) {
    normalized = "+" + normalized
  }

  return normalized
}

export function interpolateTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, "g"), value)
  })
  return result
}

export function parseVariablesFromTemplate(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}
