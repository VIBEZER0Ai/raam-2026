import { TSTracker } from "@/components/screens/ts-tracker";
import { getTimeStations, getTargetPlan } from "@/lib/db/queries";

export const revalidate = 30;

export default async function TimeStationsPage() {
  const [stations, targets] = await Promise.all([
    getTimeStations(),
    getTargetPlan(),
  ]);
  return <TSTracker stations={stations} targets={targets} />;
}
