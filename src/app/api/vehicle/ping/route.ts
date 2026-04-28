/**
 * POST /api/vehicle/ping
 *
 * Accepts position pings for support vehicles. Body:
 *   {
 *     vehicle_id: uuid,                  required
 *     lat: number,                       required
 *     lng: number,                       required
 *     speed_mph?: number,
 *     heading?: number,
 *     source?: "phone"|"garmin"|"manual"|"raam_tracker",
 *     driver_crew_id?: uuid,
 *     navigator_crew_id?: uuid,
 *     note?: string,
 *   }
 *
 * Auth: signed-in Supabase session (RLS handles team scope), or matching
 * INGEST_SECRET header for non-browser clients.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const vehicleId = typeof body.vehicle_id === "string" ? body.vehicle_id : "";
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!vehicleId) {
    return NextResponse.json({ error: "vehicle_id required" }, { status: 400 });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "lat + lng required, must be numeric" },
      { status: 400 },
    );
  }
  // Allow North America bbox + Atlantic City finish stretch
  if (lat < 20 || lat > 55 || lng < -130 || lng > -65) {
    return NextResponse.json(
      { error: "lat/lng outside RAAM bounding box" },
      { status: 400 },
    );
  }

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

  const supabase = secretMatch ? createAdminClient() : await createClient();

  // Resolve vehicle's team_id — vehicle must exist + be active. Also gives us
  // team_id without trusting the client to send it.
  const { data: veh, error: vehErr } = await supabase
    .from("support_vehicle")
    .select("id,team_id,active")
    .eq("id", vehicleId)
    .maybeSingle();
  if (vehErr || !veh) {
    return NextResponse.json(
      { error: "vehicle not found or not visible" },
      { status: 404 },
    );
  }
  if (!(veh as { active?: boolean }).active) {
    return NextResponse.json({ error: "vehicle inactive" }, { status: 400 });
  }
  const teamId = (veh as { team_id: string | null }).team_id;
  if (!teamId) {
    return NextResponse.json({ error: "vehicle missing team_id" }, { status: 500 });
  }

  const source = typeof body.source === "string" ? body.source : "phone";
  if (!["phone", "garmin", "manual", "raam_tracker"].includes(source)) {
    return NextResponse.json({ error: "invalid source" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("vehicle_position")
    .insert({
      team_id: teamId,
      vehicle_id: vehicleId,
      lat,
      lng,
      speed_mph: typeof body.speed_mph === "number" ? body.speed_mph : null,
      heading: typeof body.heading === "number" ? body.heading : null,
      source,
      driver_crew_id:
        typeof body.driver_crew_id === "string" ? body.driver_crew_id : null,
      navigator_crew_id:
        typeof body.navigator_crew_id === "string"
          ? body.navigator_crew_id
          : null,
      note: typeof body.note === "string" ? body.note : null,
    })
    .select("id, ping_at")
    .single();
  if (error) {
    console.error("[POST /api/vehicle/ping]", error);
    return NextResponse.json(
      { error: error.message ?? "insert failed" },
      { status: 500 },
    );
  }

  // Refresh /vehicles + War Room (separation banner depends on this).
  revalidatePath("/vehicles");
  revalidatePath("/");

  return NextResponse.json(
    {
      ok: true,
      id: (data as { id: string }).id,
      ping_at: (data as { ping_at: string }).ping_at,
    },
    { status: 201 },
  );
}
