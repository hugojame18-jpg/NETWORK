import { prisma } from "./prisma";
import { redis } from "./redis";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

interface Window {
  limit: number;
  windowSeconds: number;
}

/**
 * Fixed-window rate limiter. Scoped by an arbitrary key (e.g.
 * `auth:sign-in:<email>`) so different routes can define their own limits
 * without stepping on each other.
 *
 * Redis when one is configured, the application's own database otherwise.
 * It used to be Redis or nothing: without `REDIS_URL` every limit silently
 * switched off, which on a deployment that never set one up meant unlimited
 * password guesses. The database is always there, so there is always a limit.
 *
 * Fails open if both stores are unreachable — a limiter outage should stop
 * limiting, not take sign-in down with it.
 */
export async function rateLimit(
  key: string,
  window: Window,
): Promise<RateLimitResult> {
  if (process.env.REDIS_URL) {
    try {
      return await redisRateLimit(key, window);
    } catch (error) {
      console.error(
        `[rate-limit] Redis unavailable for "${key}", using the database:`,
        error,
      );
    }
  }

  try {
    return await databaseRateLimit(key, window);
  } catch (error) {
    console.error(
      `[rate-limit] No store reachable, failing open for "${key}":`,
      error,
    );
    return {
      success: true,
      remaining: window.limit,
      limit: window.limit,
      resetMs: window.windowSeconds * 1000,
    };
  }
}

async function redisRateLimit(
  key: string,
  { limit, windowSeconds }: Window,
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;
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
}

/**
 * One statement, so two requests arriving together cannot both read "4" and
 * both write "5": the row is created, or its counter bumped, or — when its
 * window has ended — started over, atomically.
 *
 * LOCALTIMESTAMP throughout, never NOW(): the column has no time zone, and
 * comparing it with a zoned value would shift the window by the session's
 * offset.
 */
async function databaseRateLimit(
  key: string,
  { limit, windowSeconds }: Window,
): Promise<RateLimitResult> {
  const rows = await prisma.$queryRaw<{ count: number; ttl: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (
      ${key},
      1,
      LOCALTIMESTAMP + (${windowSeconds}::int * INTERVAL '1 second')
    )
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."resetAt" <= LOCALTIMESTAMP THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimit"."resetAt" <= LOCALTIMESTAMP THEN EXCLUDED."resetAt"
        ELSE "RateLimit"."resetAt"
      END
    RETURNING
      "count"::int AS "count",
      GREATEST(0, EXTRACT(EPOCH FROM ("resetAt" - LOCALTIMESTAMP)))::float8 AS "ttl"
  `;

  // Sweep now and then, so keys that are never seen again do not pile up.
  // Not awaited: tidying must never slow down or fail the request it rides on.
  if (Math.random() < 0.02) {
    void prisma.$executeRaw`
      DELETE FROM "RateLimit"
      WHERE "resetAt" < LOCALTIMESTAMP - INTERVAL '1 day'
    `.catch(() => {});
  }

  const count = Number(rows[0]?.count ?? 1);
  const ttl = Number(rows[0]?.ttl ?? windowSeconds);

  return {
    success: count <= limit,
    remaining: Math.max(limit - count, 0),
    limit,
    resetMs: Math.ceil(ttl * 1000),
  };
}

export { getClientIp } from "./ip";

/** Generic guard for authenticated mutation routes: 30 writes/minute per user. */
export async function checkMutationRateLimit(userId: string) {
  const result = await rateLimit(`mutation:${userId}`, {
    limit: 30,
    windowSeconds: 60,
  });
  return result.success;
}
