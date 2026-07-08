import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

// The local `prisma dev` proxy (and some managed providers) closes idle
// sockets server-side; the pool can then hand out a dead connection whose
// first use fails. These are all "retry on a fresh connection" cases, matched
// by message substring OR Prisma connection error code (P1017 = "Server has
// closed the connection", P1001 = can't reach DB, P1002 = timeout).
const TRANSIENT_CONNECTION_MESSAGES = [
  "Connection terminated unexpectedly",
  "Server has closed the connection",
  "Can't reach database server",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "socket hang up",
];
const TRANSIENT_PRISMA_CODES = new Set(["P1017", "P1001", "P1002"]);

export function isTransientConnectionError(error: unknown): boolean {
  const code = (error as { code?: unknown })?.code;
  if (typeof code === "string" && TRANSIENT_PRISMA_CODES.has(code)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return TRANSIENT_CONNECTION_MESSAGES.some((needle) => message.includes(needle));
}

function createPrismaClient() {
  const rawConnectionString = process.env.DATABASE_URL;
  // Managed Postgres (Supabase, Neon, RDS…) requires TLS, but the node-postgres
  // driver behind `@prisma/adapter-pg` doesn't enable it from `sslmode=` in the
  // URL — it needs an explicit `ssl` pool option. Worse, a `sslmode=require` in
  // the URL actively conflicts with that option and fails the handshake (P1011).
  // So for any non-local host we strip `sslmode` from the URL and pass the
  // `ssl` option ourselves; the local `prisma dev` proxy (localhost) stays plain
  // TCP with no SSL.
  const isLocal = !rawConnectionString || /@(localhost|127\.0\.0\.1|\[::1\])/.test(rawConnectionString);
  const connectionString =
    rawConnectionString && !isLocal
      ? rawConnectionString.replace(/([?&])sslmode=[^&]*(&|$)/, (_m, p1, p2) => (p2 === "&" ? p1 : "")).replace(/[?&]$/, "")
      : rawConnectionString;
  const adapter = new PrismaPg({
    connectionString,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
    // The local `prisma dev` proxy (and some managed Postgres providers)
    // silently drop idle sockets. Closing our own idle connections quickly —
    // before the server does — minimizes the window where the pool hands out a
    // dead socket; TCP keepalive detects half-open ones. Any that still slip
    // through are absorbed by the retry wrapper below.
    max: 10,
    idleTimeoutMillis: 3_000,
    keepAlive: true,
    allowExitOnIdle: true,
  });
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  // A dropped connection can surface on the very next query after the pool
  // discards a dead socket. Retrying transparently absorbs that class of
  // failure instead of bubbling a 500 up to the user for something that
  // succeeds a moment later. Several requests can hit this back-to-back
  // right after a socket dies, so this allows a couple of retries with a
  // short backoff rather than giving up after a single attempt.
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const maxAttempts = 3;
          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              return await query(args);
            } catch (error) {
              if (!isTransientConnectionError(error) || attempt === maxAttempts) throw error;
              await new Promise((resolve) => setTimeout(resolve, attempt * 100));
            }
          }
          throw new Error("unreachable");
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
