/**
 * Vehicles page — live grid of Follow / Leapfrog / Aux + their on-duty crew,
 * latest GPS ping, and distance/time-distance to rider.
 *
 * Plus the AA6.3 separation banner: red when follow ↔ leapfrog exceeds the
 * 30-min SOP window at current speed.
 */

import { VehicleStatus } from "@/components/screens/vehicle-status";
import {
  getDerivedRaceState,
  getLatestVehiclePositions,
  getSupportVehicles,
  getCrewMembers,
} from "@/lib/db/queries";
import { getDefaultTeam } from "@/lib/team";

export const revalidate = 30;

export default async function VehiclesPage() {
  const [team, vehicles, positions, derived, crew] = await Promise.all([
    getDefaultTeam(),
    getSupportVehicles(),
    getLatestVehiclePositions(),
    getDerivedRaceState(),
    getCrewMembers(),
  ]);

  return (
    <VehicleStatus
      units={team?.units ?? "imperial"}
      vehicles={vehicles}
      positions={positions}
      crew={crew}
      rider={
        derived.latest
          ? {
              lat: Number(derived.latest.lat),
              lng: Number(derived.latest.lng),
              speedMph: Number(derived.latest.speed_mph ?? 0),
              ts: derived.latest.ts,
              currentMile: derived.currentMile,
              currentTs: derived.currentTs,
            }
          : null
      }
    />
  );
}
