/**
 * GET /api/cron/engine
 *
 * Runs the rule engine on a schedule. Two auth paths:
 *   1. Vercel's built-in cron signs requests with
 *      `Authorization: Bearer <CRON_SECRET>`. Set CRON_SECRET in env.
 *   2. External crons (GitHub Actions, cron-job.org) pass the same
 *      header manually.
 *
 * Unauthed requests return 401.
 *
 * Returns the RunnerSummary so callers see what fired.
 */

import { NextResponse } from "next/server";
import { runRuleEngine } from "@/lib/raam/rule-runner";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const ok =
    auth === `Bearer ${expected}` ||
    req.headers.get("x-cron-secret") === expected;
  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runRuleEngine();
    return NextResponse.json({
      ok: true,
      ran_at: new Date().toISOString(),
      summary,
    });
  } catch (e) {
    console.error("[/api/cron/engine]", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
