import { redirect } from "next/navigation";
import { WarRoom } from "@/components/screens/war-room";
import { StrategyCards } from "@/components/screens/strategy-cards";
import { Landing } from "@/components/screens/landing";
import {
  getTimeStations,
  getTargetPlan,
  getDerivedRaceState,
} from "@/lib/db/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTeams } from "@/lib/team";

// Fresh Supabase pull every 30s for logged-in dashboard
export const revalidate = 30;

export default async function Home() {
  const user = await getCurrentUser();

  // Logged-out visitors see the public marketing landing page.
  if (!user) {
    return <Landing />;
  }

  // Super-admin (Vishal) keeps the legacy War Room at / for now.
  // Everyone else is routed to their team dashboard.
  const memberships = await getUserTeams();
  if (memberships.length === 0) {
    redirect("/signup");
  }
  // Future: multi-team picker. For MVP: jump to the first team's dashboard.
  // War Room stays at / for Team Kabir (team_id is backfilled on all rows).

  const [stations, targets, derived] = await Promise.all([
    getTimeStations(),
    getTargetPlan(),
    getDerivedRaceState(),
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
      <WarRoom stations={stations} targets={targets} derived={derived} />
      <StrategyCards />
    </>
  );
}
