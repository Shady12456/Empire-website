// Simple in-memory rate limiter for development
// In production, use Redis or similar

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000);

export interface RateLimitOptions {
  key: string;
  limit: number;
  window: number; // in milliseconds
}

export async function rateLimitByKey(options: RateLimitOptions): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const entry = store.get(options.key);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    store.set(options.key, {
      count: 1,
      resetTime: now + options.window,
    });

    return {
      success: true,
      remaining: options.limit - 1,
      reset: now + options.window,
    };
  }

  if (entry.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return {
    success: true,
    remaining: options.limit - entry.count,
    reset: entry.resetTime,
  };
}

export function getRateLimitHeaders(result: { remaining: number; reset: number }) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}
