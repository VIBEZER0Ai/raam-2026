"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { sendDiscordMessage } from "@/lib/raam/discord";

export interface TriggerSosInput {
  note?: string;
}

export interface SosResult {
  ok: boolean;
  alertId?: string;
  discord?: "sent" | "skipped" | "failed";
  location?: { lat: number; lng: number; mile: number | null } | null;
  error?: string;
}

/**
 * Full SOS sequence (crew-initiated emergency):
 *   1. Require auth — capture who pressed it
 *   2. Pull latest GPS ping for location context (optional)
 *   3. Insert row in `alert` (severity=critical, status=open)
 *   4. Mirror to `comms_log` (channel=internal, direction=out)
 *   5. Post to crew Discord with @here mention
 *
 * Each step isolated so a partial failure (e.g. Discord down)
 * still leaves a durable record in the DB.
 */
export async function triggerSOS(input: TriggerSosInput = {}): Promise<SosResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const supabase = await createClient();

  // 1. Fetch latest GPS for context
  let location: SosResult["location"] = null;
  try {
    const { data: ping } = await supabase
      .from("gps_ping")
      .select("lat,lng,mile_from_start,matched_lat,matched_lng")
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ping) {
      const lat = Number(ping.matched_lat ?? ping.lat);
      const lng = Number(ping.matched_lng ?? ping.lng);
      location = {
        lat,
        lng,
        mile: ping.mile_from_start !== null ? Number(ping.mile_from_start) : null,
      };
    }
  } catch (e) {
    console.warn("[triggerSOS gps lookup]", e);
  }

  // 2. Derive crew_member id for the pressing user (by email match)
  let crewId: string | null = null;
  if (user.email) {
    const { data: crew } = await supabase
      .from("crew_member")
      .select("id,full_name")
      .ilike("email", user.email)
      .eq("active", true)
      .maybeSingle();
    if (crew) crewId = crew.id;
  }

  const title = input.note?.trim()
    ? `SOS — ${input.note.trim().slice(0, 80)}`
    : "SOS triggered by crew";
  const detailParts: string[] = [`Triggered by ${user.email ?? user.id}`];
  if (location) {
    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    detailParts.push(
      `Last known position: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
    );
    if (location.mile !== null) {
      detailParts.push(`Mile ${location.mile.toFixed(1)} of 3,068`);
    }
    detailParts.push(mapsUrl);
  } else {
    detailParts.push("No recent GPS ping on record.");
  }
  const body = detailParts.join("\n");

  // 3. Insert alert
  const { data: alertRow, error: alertErr } = await supabase
    .from("alert")
    .insert({
      rule_id: "SOS_MANUAL",
      severity: "critical",
      title,
      body,
      status: "open",
    })
    .select("id")
    .single();
  if (alertErr) {
    console.error("[triggerSOS alert]", alertErr);
    return { ok: false, error: `DB: ${alertErr.message}` };
  }

  // 4. Comms log mirror
  await supabase.from("comms_log").insert({
    channel: "internal",
    direction: "out",
    from_party: user.email ?? user.id,
    to_party: "crew",
    subject: "SOS",
    body,
    crew_id: crewId,
  });

  // 5. Discord broadcast (non-fatal)
  let discordStatus: SosResult["discord"] = "skipped";
  if (process.env.DISCORD_WEBHOOK_URL) {
    const res = await sendDiscordMessage({
      kind: "sos",
      title,
      body,
    });
    discordStatus = res.ok ? "sent" : "failed";
    if (!res.ok) console.warn("[triggerSOS discord]", res.error);
  }

  revalidatePath("/");
  revalidatePath("/comms");
  revalidatePath("/compliance");

  return {
    ok: true,
    alertId: alertRow.id as string,
    discord: discordStatus,
    location,
  };
}
