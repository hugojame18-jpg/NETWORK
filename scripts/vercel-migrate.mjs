// Applies Prisma migrations during the Vercel build.
//
// Runs BEFORE `next build` so the database schema is in place for the deployed
// app. Uses the non-pooling/direct connection when available (required for DDL
// — pooled/pgbouncer connections can't run migrations reliably), falling back
// to DATABASE_URL. If no database URL is configured, it skips gracefully so a
// build without DB access (e.g. a preview with no env) still succeeds.
import { execSync } from "node:child_process";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!url) {
  console.log("[vercel-migrate] No database URL set — skipping migrations.");
  process.exit(0);
}

try {
  execSync("prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
} catch (error) {
  console.error("[vercel-migrate] Migration failed:", error?.message ?? error);
  process.exit(1);
}
