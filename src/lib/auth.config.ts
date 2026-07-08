import type { NextAuthConfig } from "next-auth";
import type { UserRole, UserStatus } from "@/generated/prisma/enums";

interface AppToken {
  id: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * Edge-safe Auth.js config: no Prisma/bcrypt imports here.
 * Consumed by both `auth.ts` (full config, Node runtime) and `auth.edge.ts`
 * (middleware, no providers) so the two stay in sync on session shape.
 */
export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    session({ session, token }) {
      const appToken = token as unknown as AppToken;
      session.user.id = appToken.id;
      session.user.role = appToken.role;
      session.user.status = appToken.status;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
