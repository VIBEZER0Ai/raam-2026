"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";

export type InviteRole = "chief" | "crew" | "observer" | "rider";

export interface CrewInvite {
  email: string;
  full_name?: string;
  role: InviteRole;
}

/**
 * Invite crew members to a team by email. For each:
 *   1. Insert a crew_member row (email, role, team_id, active, auth_user_id=null)
 *   2. Insert a team_member row once auth_user_id is known (handled by the
 *      signup-link trigger from migration 0016 — user's first sign-in backfills)
 *   3. Send Supabase magic-link invite email
 *
 * Only the team owner or chief can invite.
 */
export async function inviteTeamCrew(
  teamId: string,
  invites: CrewInvite[],
): Promise<
  { ok: true; invited: number; failed: { email: string; error: string }[] }
  | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  if (invites.length === 0)
    return { ok: true, invited: 0, failed: [] };

  // Chief/owner check
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("team_member")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();
  const role = (membership as { role?: string } | null)?.role;
  if (!membership || !["owner", "chief"].includes(role ?? "")) {
    return { ok: false, error: "Only team owner or chief can invite." };
  }

  const { data: team } = await supabase
    .from("team")
    .select("slug,name")
    .eq("id", teamId)
    .single();
  const teamSlug = (team as { slug?: string } | null)?.slug ?? "";
  const teamName = (team as { name?: string } | null)?.name ?? "your team";

  const admin = createAdminClient();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://ventor.fit");

  const failed: { email: string; error: string }[] = [];
  let invited = 0;

  for (const inv of invites) {
    const email = inv.email.trim().toLowerCase();
    if (!email) continue;

    // 1. Upsert crew_member row
    const { error: cmErr } = await admin.from("crew_member").upsert(
      {
        team_id: teamId,
        email,
        full_name: inv.full_name?.trim() || email.split("@")[0],
        role:
          inv.role === "chief"
            ? "crew_chief"
            : inv.role === "rider"
              ? "rider"
              : inv.role === "observer"
                ? "observer"
                : "follow_driver", // default crew role
        active: true,
      },
      { onConflict: "team_id,email", ignoreDuplicates: false },
    );
    if (cmErr && !cmErr.message.includes("duplicate")) {
      failed.push({ email, error: cmErr.message });
      continue;
    }

    // 2. Send invite email (Supabase Auth)
    const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${origin}/team/${teamSlug}?welcome=1`,
        data: { team_slug: teamSlug, team_name: teamName, invited_by: user.id },
      },
    );
    if (inviteErr) {
      // If user already exists, Supabase returns an error. That's fine —
      // they can sign in via magic-link normally.
      if (!inviteErr.message.toLowerCase().includes("already")) {
        failed.push({ email, error: inviteErr.message });
        continue;
      }
    }
    invited += 1;
  }

  revalidatePath("/admin/roster");
  return { ok: true, invited, failed };
}

/** Mark team onboarding complete. Idempotent. */
export async function markTeamOnboarded(
  teamId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("team")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", teamId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  return { ok: true };
}
