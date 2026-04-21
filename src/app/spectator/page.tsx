import { Spectator } from "@/components/screens/spectator";
import { getTimeStations, getDerivedRaceState } from "@/lib/db/queries";

export const revalidate = 30;

export default async function SpectatorPage() {
  const [stations, derived] = await Promise.all([
    getTimeStations(),
    getDerivedRaceState(),
  ]);
  // Prefer road-snapped coords when available; fall back to raw GPS.
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
    />
  );
}
