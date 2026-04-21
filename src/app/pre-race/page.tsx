import { PreRace } from "@/components/screens/pre-race";
import {
  getTimeStations,
  getTargetPlan,
  getSleepBlocks,
} from "@/lib/db/queries";

export const revalidate = 60;

type TabId = "route" | "crew" | "sleep" | "nutrition" | "manifest";
const VALID_TABS: TabId[] = ["route", "crew", "sleep", "nutrition", "manifest"];

export default async function PreRacePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab: TabId = (VALID_TABS as string[]).includes(sp.tab ?? "")
    ? (sp.tab as TabId)
    : "route";
  const [stations, targets, sleep] = await Promise.all([
    getTimeStations(),
    getTargetPlan(),
    getSleepBlocks(),
  ]);
  return (
    <PreRace tab={tab} stations={stations} targets={targets} sleep={sleep} />
  );
}
