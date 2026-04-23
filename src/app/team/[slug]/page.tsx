import { redirect } from "next/navigation";
import { getTeamBySlug } from "@/lib/team";

/**
 * /team/[slug] — team home. For MVP this forwards to the legacy
 * dashboard (/) which currently renders Team Kabir's War Room.
 * Post-RAAM refactor will move War Room into /team/[slug].
 */
export default async function TeamHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) redirect("/signup");
  // TODO: scope dashboard by team.id. For Team Kabir (current slug)
  // this returns the same War Room experience as /.
  redirect("/");
}
