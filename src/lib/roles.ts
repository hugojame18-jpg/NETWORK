import type { UserRole } from "@/generated/prisma/enums";

/** Edge-safe: no Prisma/bcrypt imports, so both middleware.ts and rbac.ts can use it. */
export function homeForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "ADVERTISER":
      return "/advertiser";
    case "PUBLISHER":
    default:
      return "/dashboard";
  }
}
