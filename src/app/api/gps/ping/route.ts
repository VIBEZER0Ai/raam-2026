/**
 * POST /api/gps/ping
 *
 * Accepts position pings from any source (RAAM tracker scraper, Garmin relay,
 * crew phone manual report). Body:
 *   {
 *     lat: number,
 *     lng: number,
 *     speed_mph?: number,
 *     heading?: number,
 *     mile_from_start?: number,
 *     state?: string,
 *     device_id?: string,
 *     source?: "raam_tracker" | "garmin" | "manual" | "phone",
 *     note?: string
 *   }
 *
 * SECURITY NOTE: currently permissive (anon key via RLS). Add INGEST_SECRET
 * header validation when wiring real tracker scrapers.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { milesFromStart } from "@/lib/raam/route-lookup";
import { snapPoint } from "@/lib/raam/map-match";
import { runRuleEngine } from "@/lib/raam/rule-runner";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "lat + lng required, must be numeric" },
      { status: 400 },
    );
  }
  if (lat < 20 || lat > 50 || lng < -130 || lng > -65) {
    return NextResponse.json(
      { error: "lat/lng outside RAAM bounding box (20-50N, 65-130W)" },
      { status: 400 },
    );
  }

  // Auth gate — either valid Supabase session OR matching INGEST_SECRET header.
  const headerSecret = req.headers.get("x-ingest-secret");
  const expectedSecret = process.env.INGEST_SECRET;
  const secretMatch =
    !!expectedSecret && !!headerSecret && headerSecret === expectedSecret;

  const user = secretMatch ? null : await getCurrentUser();
  if (!secretMatch && !user) {
    return NextResponse.json(
      { error: "Sign in required, or set x-ingest-secret header." },
      { status: 401 },
    );
  }

  // Auto-derive mile_from_start from the polyline if caller didn't supply.
  let mileFromStart: number | null =
    typeof body.mile_from_start === "number" ? body.mile_from_start : null;
  let deviationMi: number | null = null;
  if (mileFromStart === null) {
    const lookup = await milesFromStart({ lat, lng });
    if (lookup) {
      mileFromStart = lookup.mile_from_start;
      deviationMi = lookup.deviation_mi;
    }
  }

  // When secret matches, use service-role client (bypasses RLS).
  // When user authenticated, normal SSR client (RLS enforces authenticated role).
  const supabase = secretMatch ? createAdminClient() : await createClient();

  // Map Matching — snap raw GPS to road geometry using the previous ping.
  // Skipped when no prior ping exists (bootstrap), or when it's > 30 min old
  // (stale pairing produces bad matches across gaps).
  let matchedLat: number | null = null;
  let matchedLng: number | null = null;
  let matchConfidence: number | null = null;
  try {
    const { data: prior } = await supabase
      .from("gps_ping")
      .select("lat,lng,ts")
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (prior) {
      const priorAgeMs = Date.now() - new Date(prior.ts).getTime();
      if (priorAgeMs < 30 * 60_000) {
        const snapped = await snapPoint(
          { lat: Number(prior.lat), lng: Number(prior.lng) },
          { lat, lng },
        );
        if (snapped) {
          matchedLat = Number(snapped.lat.toFixed(7));
          matchedLng = Number(snapped.lng.toFixed(7));
          matchConfidence = Number(snapped.confidence.toFixed(3));
        }
      }
    }
  } catch (e) {
    console.warn("[POST /api/gps/ping map-match]", e);
  }

  const noteWithDeviation =
    typeof body.note === "string"
      ? body.note
      : deviationMi !== null && deviationMi > 2
        ? `off-route ${deviationMi.toFixed(1)} mi`
        : null;
  const { error, data } = await supabase
    .from("gps_ping")
    .insert({
      lat,
      lng,
      speed_mph:
        typeof body.speed_mph === "number" ? body.speed_mph : null,
      heading: typeof body.heading === "number" ? body.heading : null,
      mile_from_start: mileFromStart,
      state: typeof body.state === "string" ? body.state : null,
      device_id:
        typeof body.device_id === "string" ? body.device_id : null,
      source: typeof body.source === "string" ? body.source : "manual",
      note: noteWithDeviation,
      matched_lat: matchedLat,
      matched_lng: matchedLng,
      match_confidence: matchConfidence,
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/gps/ping]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/compliance");
  revalidatePath("/crew");

  // Fire the rule engine on the fresh context. Non-fatal — ping is already stored.
  // The runner dedupes against recent evaluations, so rapid pings don't spam Discord.
  let engine: Awaited<ReturnType<typeof runRuleEngine>> | null = null;
  try {
    engine = await runRuleEngine();
  } catch (e) {
    console.warn("[POST /api/gps/ping rule-runner]", e);
  }

  return NextResponse.json({ ok: true, ping: data, engine }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gps_ping")
    .select("ts,lat,lng,speed_mph,mile_from_start,state,source")
    .order("ts", { ascending: false })
    .limit(1)
    .single();
  if (error) return NextResponse.json({ ping: null });
  return NextResponse.json({ ping: data });
}
