"use client";

/**
 * Compact separation alert for the War Room. Shows only when SOP is breached
 * or pings are stale — silent during nominal operation.
 */

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  computeSeparation,
  VEHICLE_SEP_SOP_MINUTES,
} from "@/lib/raam/vehicle-separation";
import { formatDistance, type UnitsPref } from "@/lib/units";
import type { DbVehiclePosition, DbSupportVehicle } from "@/lib/db/queries";

export function SeparationAlert({
  vehicles,
  positions,
  riderSpeedMph,
  units,
}: {
  vehicles: DbSupportVehicle[];
  positions: DbVehiclePosition[];
  riderSpeedMph?: number;
  units: UnitsPref;
}) {
  const posByVeh = new Map(positions.map((p) => [p.vehicle_id, p]));
  const followV = vehicles.find((v) => v.kind === "follow");
  const leapV = vehicles.find((v) => v.kind === "leapfrog");
  const followP = followV ? posByVeh.get(followV.id) : null;
  const leapP = leapV ? posByVeh.get(leapV.id) : null;
  if (!followP || !leapP) return null;

  const sep = computeSeparation(
    Number(followP.lat),
    Number(followP.lng),
    Number(leapP.lat),
    Number(leapP.lng),
    {
      speedMph: riderSpeedMph,
      followPingAt: followP.ping_at,
      leapPingAt: leapP.ping_at,
    },
  );

  if (!sep.exceedsSop && !sep.stale) return null;

  return (
    <Link
      href="/vehicles"
      className="flex items-center gap-3 rounded-xl border border-red-700 bg-red-500/15 px-4 py-3 text-[12px] text-red-200 hover:bg-red-500/20"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-red-100">
          {sep.stale
            ? "Vehicle GPS stale — separation unknown"
            : `Follow ↔ Leapfrog ${Math.round(sep.minutes)} min apart · SOP cap ${VEHICLE_SEP_SOP_MINUTES} min`}
        </div>
        {!sep.stale && (
          <div className="font-mono text-[11px] text-red-300/80">
            distance {formatDistance(sep.miles, units, 1)} · tap to open
          </div>
        )}
      </div>
    </Link>
  );
}
