import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";
import { signInSchema } from "./validations/auth";
import { rateLimit } from "./rate-limit";
import { getClientIp, hashIp } from "./ip";

export class AccountSuspendedError extends CredentialsSignin {
  code = "account_suspended";
}

export class AccountBannedError extends CredentialsSignin {
  code = "account_banned";
}

export class TooManyAttemptsError extends CredentialsSignin {
  code = "too_many_attempts";
}

/** Sign-in attempts allowed per window, for one account and for one address. */
const SIGN_IN_WINDOW_SECONDS = 15 * 60;
const SIGN_IN_PER_ACCOUNT = 10;
const SIGN_IN_PER_ADDRESS = 40;

/** How often a live session re-reads role/status from the database. */
const TOKEN_REFRESH_MS = 60_000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    /**
     * The base (edge-safe) callback only stamps role/status at sign-in, which
     * leaves a session carrying stale claims: promoting an account to ADMIN
     * doesn't take effect, and suspending one doesn't revoke access until the
     * token expires. Here, in the Node runtime, Prisma is reachable, so both
     * are re-read from the database at most once per TOKEN_REFRESH_MS.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.refreshedAt = Date.now();
        return token;
      }

      const refreshedAt =
        typeof token.refreshedAt === "number" ? token.refreshedAt : 0;
      if (!token.id || Date.now() - refreshedAt < TOKEN_REFRESH_MS)
        return token;

      const fresh = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { role: true, status: true },
      });
      // A deleted user keeps its last known claims; route guards still reject it.
      if (fresh) {
        token.role = fresh.role;
        token.status = fresh.status;
      }
      token.refreshedAt = Date.now();
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Sign-in was the one door with no limit on it: a password could be
        // guessed at as fast as the server would answer. Two counters, since
        // they stop different things — one per account, against someone
        // working on a single password, and one per address, against someone
        // trying one password on many accounts. Both keys are hashed, so the
        // table of counters holds no email and no address.
        const [byAccount, byAddress] = await Promise.all([
          rateLimit(`sign-in:account:${hashIp(parsed.data.email)}`, {
            limit: SIGN_IN_PER_ACCOUNT,
            windowSeconds: SIGN_IN_WINDOW_SECONDS,
          }),
          rateLimit(
            `sign-in:address:${hashIp(getClientIp(request.headers))}`,
            {
              limit: SIGN_IN_PER_ADDRESS,
              windowSeconds: SIGN_IN_WINDOW_SECONDS,
            },
          ),
        ]);
        if (!byAccount.success || !byAddress.success) {
          throw new TooManyAttemptsError();
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!isValid) return null;

        if (user.status === "BANNED") throw new AccountBannedError();
        if (user.status === "SUSPENDED") throw new AccountSuspendedError();

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
});
