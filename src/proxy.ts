import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.edge";
import { homeForRole } from "@/lib/roles";

const ROLE_PREFIXES: Record<string, "PUBLISHER" | "ADVERTISER" | "ADMIN"> = {
  "/dashboard": "PUBLISHER",
  "/advertiser": "ADVERTISER",
  "/admin": "ADMIN",
};

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) => pathname.startsWith(prefix));
  if (!matchedPrefix) return NextResponse.next();

  if (!session?.user) {
    const signInUrl = new URL("/sign-in", nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (session.user.status === "SUSPENDED" || session.user.status === "BANNED") {
    return NextResponse.redirect(new URL("/account-restricted", nextUrl));
  }

  const requiredRole = ROLE_PREFIXES[matchedPrefix];
  if (session.user.role !== requiredRole) {
    return NextResponse.redirect(new URL(homeForRole(session.user.role), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/advertiser/:path*", "/admin/:path*"],
};
