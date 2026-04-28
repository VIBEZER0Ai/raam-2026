/**
 * Team context helpers — resolve the signed-in user's active team.
 *
 * Path-based multi-tenancy: /team/[slug]/* routes pass `slug` to the
 * page, which calls getTeamBySlug(slug). For non-scoped routes we fall
 * back to getDefaultTeam() = user's most-recent team (or only team).
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { UnitsPref } from "@/lib/units";

export interface Team {
  id: string;
  slug: string;
  name: string;
  sport: string;
  event_code: string | null;
  race_start_at: string | null;
  timezone: string | null;
  plan: "free" | "pro" | "team";
  owner_user_id: string | null;
  active: boolean;
  units: UnitsPref;
}

export interface TeamMembership {
  team: Team;
  role: "owner" | "chief" | "crew" | "observer" | "rider";
  crew_member_id: string | null;
}

export const getUserTeams = cache(async (): Promise<TeamMembership[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_member")
    .select("role, crew_member_id, team:team_id(*)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });
  if (error || !data) return [];
  return data
    .filter((r) => r.team)
    .map((r) => ({
      team: r.team as unknown as Team,
      role: r.role as TeamMembership["role"],
      crew_member_id: r.crew_member_id,
    }));
});

export const getDefaultTeam = cache(async (): Promise<Team | null> => {
  const memberships = await getUserTeams();
  return memberships[0]?.team ?? null;
});

export const getTeamBySlug = cache(
  async (slug: string): Promise<Team | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("team")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Team | null) ?? null;
  },
);

export const isPlatformAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_admin")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return !!data;
});
