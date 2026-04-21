import { CrewTracker } from "@/components/screens/crew-tracker";
import { getTimeStations, getDerivedRaceState } from "@/lib/db/queries";

export const revalidate = 30;

export default async function CrewPage() {
  const [stations, derived] = await Promise.all([
    getTimeStations(),
    getDerivedRaceState(),
  ]);
  return <CrewTracker stations={stations} currentTs={derived.currentTs} />;
}
