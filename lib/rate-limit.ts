import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * In-memory sliding window rate limiter.
 * Note: counters reset on serverless cold starts — acceptable for v1.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const hits = new Map<string, number[]>();

  // Periodic cleanup every 60 seconds
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits) {
      const valid = timestamps.filter((t) => now - t < config.windowMs);
      if (valid.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, valid);
      }
    }
  }, 60_000);

  // Allow cleanup timer to not prevent process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const timestamps = (hits.get(key) || []).filter(
        (t) => now - t < config.windowMs
      );

      if (timestamps.length >= config.maxRequests) {
        const oldestInWindow = timestamps[0];
        const retryAfterSeconds = Math.ceil(
          (oldestInWindow + config.windowMs - now) / 1000
        );
        return { allowed: false, retryAfterSeconds };
      }

      timestamps.push(now);
      hits.set(key, timestamps);
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

/**
 * Extract client IP from request headers (works behind proxies like Vercel).
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Rate limiter instances (persist across requests in the same process)
const ONE_HOUR = 60 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const loginEmailLimiter = createRateLimiter({
  windowMs: ONE_HOUR,
  maxRequests: 3,
});

export const loginIpLimiter = createRateLimiter({
  windowMs: ONE_HOUR,
  maxRequests: 10,
});

export const verifyIpLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES,
  maxRequests: 10,
});

/**
 * Return a 429 response with Retry-After header.
 * Uses the same body as success responses to prevent information leakage.
 */
export function rateLimitResponse(
  retryAfterSeconds: number,
  body: Record<string, string> = { message: "Magic link sent" }
): NextResponse {
  return NextResponse.json(body, {
    status: 429,
    headers: { "Retry-After": String(retryAfterSeconds) },
  });
}
