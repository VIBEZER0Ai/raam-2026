"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { UnitsPref } from "@/lib/units";

/**
 * Flip the units preference on a team. Any team member with role chief/owner
 * can change it. RLS still applies — non-members get blocked at the DB layer.
 */
export async function setTeamUnits(input: {
  teamSlug: string;
  units: UnitsPref;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "not signed in" };
  if (input.units !== "imperial" && input.units !== "metric") {
    return { ok: false, error: "invalid units" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("team")
    .update({ units: input.units })
    .eq("slug", input.teamSlug);
  if (error) {
    console.error("[setTeamUnits]", error);
    return { ok: false, error: error.message };
  }

  // Refresh every authenticated route — units affect chrome + screens.
  revalidatePath("/", "layout");
  return { ok: true };
}
