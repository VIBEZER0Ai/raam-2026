import { notFound } from "next/navigation";
import { Spectator } from "@/components/screens/spectator";
import { getTimeStations, getDerivedRaceState } from "@/lib/db/queries";
import { getTeamBySlug } from "@/lib/team";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  return {
    title: team
      ? `${team.name} · Live tracker · Ventor`
      : "Team not found · Ventor",
    description: team
      ? `Live position and time-station progress for ${team.name}.`
      : undefined,
  };
}

export default async function TeamSpectatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const [stations, derived] = await Promise.all([
    getTimeStations(),
    getDerivedRaceState(),
  ]);

  const current = derived.latest
    ? derived.latest.matched_lat !== null &&
      derived.latest.matched_lng !== null
      ? {
          lat: Number(derived.latest.matched_lat),
          lng: Number(derived.latest.matched_lng),
        }
      : derived.latest.lat !== null && derived.latest.lng !== null
        ? {
            lat: Number(derived.latest.lat),
            lng: Number(derived.latest.lng),
          }
        : null
    : null;

  return (
    <Spectator
      stations={stations}
      currentTs={derived.currentTs}
      current={current}
      teamName={team.name}
      teamSlug={team.slug}
    />
  );
}
