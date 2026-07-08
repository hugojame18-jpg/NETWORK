import { redis } from "./redis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/**
 * Fixed-window rate limiter backed by Redis. Scoped by an arbitrary key
 * (e.g. `auth:sign-in:<ip>`) so different routes can define their own
 * limits without stepping on each other.
 *
 * Fails open (allows the request) if Redis is unreachable — a rate limiter
 * outage should never take the whole app down with it, it should just stop
 * limiting until Redis comes back.
 */
export async function rateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;

  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }
    const ttl = await redis.ttl(redisKey);

    return {
      success: count <= limit,
      remaining: Math.max(limit - count, 0),
      limit,
      resetMs: (ttl > 0 ? ttl : windowSeconds) * 1000,
    };
  } catch (error) {
    console.error(`[rate-limit] Redis unavailable, failing open for "${key}":`, error);
    return { success: true, remaining: limit, limit, resetMs: windowSeconds * 1000 };
  }
}

export { getClientIp } from "./ip";

/** Generic guard for authenticated mutation routes: 30 writes/minute per user. */
export async function checkMutationRateLimit(userId: string) {
  const result = await rateLimit(`mutation:${userId}`, { limit: 30, windowSeconds: 60 });
  return result.success;
}
