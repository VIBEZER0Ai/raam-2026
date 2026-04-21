"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { milesFromStart } from "@/lib/raam/route-lookup";

export interface ManualPingInput {
  lat: number;
  lng: number;
  speed_mph?: number;
  mile_from_start?: number;
  state?: string;
  note?: string;
}

export async function manualPing(
  input: ManualPingInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    !Number.isFinite(input.lat) ||
    !Number.isFinite(input.lng) ||
    input.lat < 20 ||
    input.lat > 50 ||
    input.lng < -130 ||
    input.lng > -65
  ) {
    return { ok: false, error: "lat/lng outside RAAM bounds" };
  }
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  // Auto-compute mile_from_start from polyline if not provided.
  let mileFromStart = input.mile_from_start ?? null;
  let noteSuffix = "";
  if (mileFromStart === null) {
    const lookup = await milesFromStart({ lat: input.lat, lng: input.lng });
    if (lookup) {
      mileFromStart = lookup.mile_from_start;
      if (lookup.deviation_mi > 2) {
        noteSuffix = ` (off-route ${lookup.deviation_mi.toFixed(1)} mi)`;
      }
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("gps_ping").insert({
    lat: input.lat,
    lng: input.lng,
    speed_mph: input.speed_mph ?? null,
    mile_from_start: mileFromStart,
    state: input.state ?? null,
    source: "manual",
    note: input.note ? `${input.note}${noteSuffix}` : noteSuffix || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/compliance");
  revalidatePath("/crew");
  return { ok: true };
}
