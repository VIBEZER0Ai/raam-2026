"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface SignupTeamInput {
  name: string;
  slug: string; // a-z, 0-9, hyphen
  sport: "cycling" | "running" | "triathlon" | "bikepacking" | "multi" | "other";
  event_code: string | null;
  race_start_at?: string | null; // ISO
  timezone?: string;
}

const SLUG_RX = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export async function createTeam(
  input: SignupTeamInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  if (!input.name.trim()) return { ok: false, error: "Team name required." };
  const slug = input.slug.trim().toLowerCase();
  if (!SLUG_RX.test(slug))
    return {
      ok: false,
      error:
        "Slug must be 3-40 chars, a-z, 0-9, hyphens only; no leading or trailing hyphen.",
    };

  const supabase = await createClient();

  // Reserve slug — unique constraint on team.slug handles race
  const { data: team, error: teamErr } = await supabase
    .from("team")
    .insert({
      slug,
      name: input.name.trim(),
      sport: input.sport,
      event_code: input.event_code,
      race_start_at: input.race_start_at ?? null,
      timezone: input.timezone ?? "America/Los_Angeles",
      owner_user_id: user.id,
    })
    .select("id, slug")
    .single();
  if (teamErr || !team) {
    const msg = teamErr?.message ?? "Team insert failed";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { ok: false, error: "Slug already taken — try another." };
    }
    return { ok: false, error: msg };
  }

  // Self as owner
  await supabase.from("team_member").insert({
    team_id: team.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/");
  return { ok: true, slug: team.slug as string };
}
