import Redis from "ioredis";

declare global {
  var __redis: Redis | undefined;
}

/**
 * Redis is optional: it backs rate-limiting and fraud heuristics, both of which
 * fail open when it's unavailable. In environments without a Redis add-on (e.g.
 * Vercel with no REDIS_URL), we must NOT let ioredis dial localhost:6379 — the
 * connection is refused and ioredis emits an unhandled 'error' event that
 * crashes the serverless function. So:
 *   - no REDIS_URL  → a stub whose commands reject (callers fail open);
 *   - REDIS_URL set → a real client with an 'error' handler so a transient
 *     outage never bubbles up as an unhandled event.
 */
function createRedis(): Redis {
  const url = process.env.REDIS_URL;

  if (!url) {
    const reject = () => Promise.reject(new Error("REDIS_URL not configured"));
    return new Proxy({} as Redis, { get: () => reject });
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 2,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });
  // Swallow connection errors so they never surface as an unhandled 'error'
  // event; the rate-limit/fraud callers already fail open on rejected commands.
  client.on("error", () => {});
  return client;
}

export const redis = global.__redis ?? createRedis();

if (process.env.NODE_ENV !== "production") {
  global.__redis = redis;
}
