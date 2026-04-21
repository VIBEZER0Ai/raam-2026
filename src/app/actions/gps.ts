"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const { error } = await supabase.from("gps_ping").insert({
    lat: input.lat,
    lng: input.lng,
    speed_mph: input.speed_mph ?? null,
    mile_from_start: input.mile_from_start ?? null,
    state: input.state ?? null,
    source: "manual",
    note: input.note ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/compliance");
  revalidatePath("/crew");
  return { ok: true };
}
