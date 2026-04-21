import { Spectator } from "@/components/screens/spectator";
import { getTimeStations, getDerivedRaceState } from "@/lib/db/queries";

export const revalidate = 30;

export default async function SpectatorPage() {
  const [stations, derived] = await Promise.all([
    getTimeStations(),
    getDerivedRaceState(),
  ]);
  const current =
    derived.latest && derived.latest.lat !== null && derived.latest.lng !== null
      ? {
          lat: Number(derived.latest.lat),
          lng: Number(derived.latest.lng),
        }
      : null;
  return (
    <Spectator
      stations={stations}
      currentTs={derived.currentTs}
      current={current}
    />
  );
}
