import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { maybeSyncFlowTraffic, syncFlowTraffic } from "@/lib/flow";

export const dynamic = "force-dynamic";
// The window is a few days of one affiliate account; well inside the limit,
// but the default 10s would be tight if Flow is slow to answer.
export const maxDuration = 60;

function bearerMatches(request: Request, expected: string): boolean {
  const given = request.headers.get("authorization") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(`Bearer ${expected}`);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Vercel Cron calls this on a schedule; see vercel.json.
 *
 * With `CRON_SECRET` set, only a caller carrying it gets a full sync and its
 * report.
 *
 * Without one, this used to answer 401 to everybody, the scheduler included —
 * so on a deployment where nobody had created the variable, the nightly sync
 * simply never ran. It now runs the throttled sync instead: the same one that
 * opening a statistics page already triggers, limited to one real call to the
 * network every twenty minutes however often this is hit, and it says nothing
 * back about what it found. An anonymous caller can therefore do no more than
 * a visitor can, and the night's figures arrive either way.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    await maybeSyncFlowTraffic();
    return NextResponse.json({ ok: true });
  }

  if (!bearerMatches(request, secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const summary = await syncFlowTraffic();
  return NextResponse.json(summary, { status: summary.ok ? 200 : 500 });
}
