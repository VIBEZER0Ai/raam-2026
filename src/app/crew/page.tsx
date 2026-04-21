import { CrewTracker } from "@/components/screens/crew-tracker";
import {
  getTimeStations,
  getDerivedRaceState,
  getCrewMembers,
} from "@/lib/db/queries";

export const revalidate = 30;

export default async function CrewPage() {
  const [stations, derived, crew] = await Promise.all([
    getTimeStations(),
    getDerivedRaceState(),
    getCrewMembers(),
  ]);
  return (
    <CrewTracker
      stations={stations}
      currentTs={derived.currentTs}
      crew={crew}
    />
  );
}
