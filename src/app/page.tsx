import { WarRoom } from "@/components/screens/war-room";
import { StrategyCards } from "@/components/screens/strategy-cards";
import { getTimeStations, getTargetPlan } from "@/lib/db/queries";

// Fresh Supabase pull every 30s
export const revalidate = 30;

export default async function Home() {
  const [stations, targets] = await Promise.all([
    getTimeStations(),
    getTargetPlan(),
  ]);

  if (stations.length === 0) {
    return (
      <div className="rounded-xl border border-amber-900/60 bg-amber-500/10 p-6 text-amber-200">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
          Supabase empty
        </div>
        <div className="mt-2 text-[14px]">
          No time stations returned. Run{" "}
          <code className="font-mono">supabase/migrations/0002_seed_time_stations.sql</code>{" "}
          + the public-read policy.
        </div>
      </div>
    );
  }

  return (
    <>
      <WarRoom stations={stations} targets={targets} />
      <StrategyCards />
    </>
  );
}
