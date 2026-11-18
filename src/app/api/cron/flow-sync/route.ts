import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { syncFlowTraffic } from "@/lib/flow";

export const dynamic = "force-dynamic";
// The window is a few days of one affiliate account; well inside the limit,
// but the default 10s would be tight if Flow is slow to answer.
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  // Fail closed. Without a secret configured this endpoint stays shut rather
  // than letting anyone on the internet schedule work on the database.
  if (!expected) return false;

  const given = request.headers.get("authorization") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(`Bearer ${expected}`);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Vercel Cron calls this on a schedule; see vercel.json. */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const summary = await syncFlowTraffic();
  return NextResponse.json(summary, { status: summary.ok ? 200 : 500 });
}
