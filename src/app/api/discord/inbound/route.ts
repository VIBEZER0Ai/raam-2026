/**
 * POST /api/discord/inbound
 *
 * Receives forwarded Discord messages from an external relay and writes
 * them to comms_log. Secured by DISCORD_INBOUND_SECRET header.
 *
 * Relay options documented in docs/discord-bridge.md. Typical setup:
 *   - Free-tier Discord bot (discord.js) listening to Gateway events
 *   - Runs on a small VPS or Cloudflare Worker
 *   - Posts to this endpoint with x-discord-secret header
 *
 * Body (DiscordInboundPayload):
 *   {
 *     channel: "#race-announcements",
 *     author: "RAAM HQ",
 *     content: "Weather hold called at TS14...",
 *     ts_iso?: "2026-06-18T14:22:00Z",
 *     message_id?: "118273...",
 *     server?: "RAAM HQ"
 *   }
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DiscordInboundPayload } from "@/lib/raam/discord";

export async function POST(req: Request) {
  const secretHeader = req.headers.get("x-discord-secret");
  const expected = process.env.DISCORD_INBOUND_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "DISCORD_INBOUND_SECRET not configured on server" },
      { status: 500 },
    );
  }
  if (secretHeader !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: DiscordInboundPayload;
  try {
    body = (await req.json()) as DiscordInboundPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (
    typeof body.channel !== "string" ||
    typeof body.author !== "string" ||
    typeof body.content !== "string"
  ) {
    return NextResponse.json(
      { error: "channel, author, content required" },
      { status: 400 },
    );
  }

  const ts = body.ts_iso ? new Date(body.ts_iso) : new Date();
  if (Number.isNaN(ts.getTime())) {
    return NextResponse.json({ error: "invalid ts_iso" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotence — if message_id provided, dedupe on subject column
  // (we store it there).
  if (body.message_id) {
    const { data: existing } = await admin
      .from("comms_log")
      .select("id")
      .eq("subject", body.message_id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { ok: true, deduped: true },
        { status: 200 },
      );
    }
  }

  const { error, data } = await admin
    .from("comms_log")
    .insert({
      ts: ts.toISOString(),
      channel: "discord",
      direction: "in",
      from_party: body.author.slice(0, 120),
      to_party: `${body.server ?? "RAAM HQ"} ${body.channel}`.slice(0, 120),
      subject: body.message_id ?? null,
      body: body.content.slice(0, 4000),
    })
    .select("id,ts")
    .single();

  if (error) {
    console.error("[POST /api/discord/inbound]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id, ts: data.ts }, { status: 201 });
}
