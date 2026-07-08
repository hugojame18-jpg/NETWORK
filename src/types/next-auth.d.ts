import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: UserRole;
    status: UserStatus;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
  }
}
