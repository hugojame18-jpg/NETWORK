import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Edge-runtime auth instance used exclusively by middleware.ts — it only
 * decodes the session JWT (no providers, no Prisma/bcrypt), which keeps it
 * safe to run outside the Node.js runtime.
 */
export const { auth } = NextAuth(authConfig);
