/**
 * GET /api/cron/whoop-sync  Bearer CRON_SECRET
 * Pulls recovery + sleep for every stored Whoop token.
 */

import { NextResponse } from "next/server";
import { runWhoopSync } from "@/lib/whoop/sync";

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
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const summary = await runWhoopSync();
  return NextResponse.json({ ran_at: new Date().toISOString(), ...summary });
}
