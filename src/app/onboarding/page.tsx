import { redirect } from "next/navigation";
import { OnboardingWizard } from "./onboarding-wizard";
import { getCurrentUser } from "@/lib/auth/session";
import { getTeamBySlug, getUserTeams } from "@/lib/team";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Set up your team · Ventor" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/onboarding");

  const { team: slug } = await searchParams;
  if (!slug) {
    const teams = await getUserTeams();
    if (teams.length === 0) redirect("/signup");
    redirect(`/onboarding?team=${teams[0].team.slug}`);
  }

  const team = await getTeamBySlug(slug);
  if (!team) redirect("/signup");

  // Block other teams' owners/chiefs from poking someone else's onboarding
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("team_member")
    .select("role")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .maybeSingle();
  const role = (membership as { role?: string } | null)?.role;
  if (!membership || !["owner", "chief"].includes(role ?? "")) {
    redirect(`/team/${team.slug}`);
  }

  return (
    <OnboardingWizard
      teamId={team.id}
      teamSlug={team.slug}
      teamName={team.name}
      alreadyOnboarded={!!team.race_start_at && !!membership}
    />
  );
}
