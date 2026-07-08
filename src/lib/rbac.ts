import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { homeForRole } from "@/lib/roles";
import type { UserRole } from "@/generated/prisma/enums";

export { homeForRole };

/** Returns the current session, or null if signed out. Safe to call anywhere on the server. */
export async function getSession() {
  return auth();
}

/** Returns the current session's user, or redirects to sign-in if there isn't one. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  return session.user;
}

/**
 * Requires the current user to have one of the given roles, otherwise
 * redirects to their own dashboard (not a 403 page — routing a Publisher
 * away from /admin should feel like "there's nothing here for you", not
 * an error).
 */
export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect(homeForRole(user.role));
  }
  return user;
}

/**
 * Fine-grained permission check for admin actions, on top of the coarse
 * role check. Every ADMIN gets full access by default; UserPermission rows
 * allow scoping specific admin accounts down to a subset of actions.
 */
export async function can(userId: string, permissionKey: string): Promise<boolean> {
  const grant = await prisma.userPermission.findFirst({
    where: { userId, permission: { key: permissionKey } },
    select: { id: true },
  });
  return grant !== null;
}

export async function requirePermission(permissionKey: string) {
  const user = await requireRole("ADMIN");
  const allowed = await can(user.id, permissionKey);
  if (!allowed) redirect("/admin");
  return user;
}

export class ApiAuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** For Route Handlers: throws ApiAuthError instead of redirecting (there's no page to redirect to). */
export async function requireApiRole(...roles: UserRole[]) {
  const session = await getSession();
  if (!session?.user) throw new ApiAuthError(401, "Non authentifié");
  if (!roles.includes(session.user.role)) throw new ApiAuthError(403, "Accès refusé");
  if (session.user.status === "SUSPENDED" || session.user.status === "BANNED") {
    throw new ApiAuthError(403, "Compte restreint");
  }
  return session.user;
}
