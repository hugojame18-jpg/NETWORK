import Redis from "ioredis";

declare global {
  var __redis: Redis | undefined;
}

export const redis =
  global.__redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 2,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

if (process.env.NODE_ENV !== "production") {
  global.__redis = redis;
}
