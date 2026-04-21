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

  // When secret matches, use service-role client (bypasses RLS).
  // When user authenticated, normal SSR client (RLS enforces authenticated role).
  const supabase = secretMatch ? createAdminClient() : await createClient();
  const { error, data } = await supabase
    .from("gps_ping")
    .insert({
      lat,
      lng,
      speed_mph:
        typeof body.speed_mph === "number" ? body.speed_mph : null,
      heading: typeof body.heading === "number" ? body.heading : null,
      mile_from_start:
        typeof body.mile_from_start === "number"
          ? body.mile_from_start
          : null,
      state: typeof body.state === "string" ? body.state : null,
      device_id:
        typeof body.device_id === "string" ? body.device_id : null,
      source: typeof body.source === "string" ? body.source : "manual",
      note: typeof body.note === "string" ? body.note : null,
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

  return NextResponse.json({ ok: true, ping: data }, { status: 201 });
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
