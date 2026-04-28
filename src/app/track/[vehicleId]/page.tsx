/**
 * /track/[vehicleId] — PWA-style tracker for a support vehicle.
 *
 * Open this page on the on-duty crew member's phone. Tap "Start tracking"
 * once. The page calls watchPosition + posts to /api/vehicle/ping every
 * ~30s as long as the tab is open and visible.
 *
 * Designed to be added to the iOS / Android home screen so it survives
 * app switches like a native app (uses /manifest.webmanifest).
 */

import { Tracker } from "@/components/screens/tracker";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getCrewMembers } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=/track/${vehicleId}`);
  }

  // Resolve vehicle. RLS ensures only team members see their own vehicles.
  const supabase = await createClient();
  const { data: vehicleRow } = await supabase
    .from("support_vehicle")
    .select("id, call_sign, kind, team_id, active")
    .eq("id", vehicleId)
    .maybeSingle();

  if (!vehicleRow) {
    return (
      <div className="rounded-xl border border-amber-900/60 bg-amber-500/10 p-5 text-amber-200">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
          Vehicle not found
        </div>
        <div className="mt-2 text-[13px]">
          Either the link is wrong, or you&apos;re not on this vehicle&apos;s
          team. Open <code className="font-mono">/vehicles</code> and pick one
          of yours.
        </div>
      </div>
    );
  }

  const crew = await getCrewMembers();

  return (
    <Tracker
      vehicle={{
        id: vehicleRow.id as string,
        callSign: vehicleRow.call_sign as string,
        kind: vehicleRow.kind as
          | "follow"
          | "leapfrog"
          | "aux"
          | "rv"
          | "media",
      }}
      crew={crew.map((c) => ({ id: c.id, name: c.full_name }))}
    />
  );
}
