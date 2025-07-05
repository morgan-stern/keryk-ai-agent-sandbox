// Simple in-memory rate limiter for demo purposes
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remainingRequests: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true, remainingRequests: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remainingRequests: 0 }
  }

  // Increment count
  entry.count++
  return { allowed: true, remainingRequests: limit - entry.count }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 300000) // Clean up every 5 minutes