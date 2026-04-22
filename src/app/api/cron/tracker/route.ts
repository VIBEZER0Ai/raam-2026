/**
 * GET /api/cron/tracker
 *
 * Runs the RAAM official tracker adapter on a schedule. Auth via
 * Authorization: Bearer <CRON_SECRET>, same as /api/cron/engine.
 *
 * Behaviour:
 *  - Adapter disabled → returns {ok:true, disabled:true}
 *  - Adapter enabled → fetches, dedupes, forwards to /api/gps/ping
 *    which runs Map Matching + mile lookup + rule engine.
 *
 * Hit every 5 min via the existing GitHub Actions cron workflow.
 */

import { NextResponse } from "next/server";
import { runTracker } from "@/lib/raam/tracker";

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
  const headerSecret = req.headers.get("x-cron-secret");
  const ok = auth === `Bearer ${expected}` || headerSecret === expected;
  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runTracker();
  return NextResponse.json({ ran_at: new Date().toISOString(), ...result });
}
