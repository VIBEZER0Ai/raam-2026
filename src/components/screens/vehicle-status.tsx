"use client";

import { Card, CardBody, CardHead } from "@/components/ui/card";
import {
  type DbCrewMember,
  type DbSupportVehicle,
  type DbVehiclePosition,
} from "@/lib/db/queries";
import {
  computeSeparation,
  haversineMiles,
  VEHICLE_SEP_SOP_MINUTES,
} from "@/lib/raam/vehicle-separation";
import { useTick } from "@/lib/raam/use-tick";
import { fmtPingAge } from "@/lib/raam/format";
import { formatDistance, formatSpeed, type UnitsPref } from "@/lib/units";
import { cn } from "@/lib/utils";
import {
  Truck,
  ArrowRight,
  Bike,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface RiderState {
  lat: number;
  lng: number;
  speedMph: number;
  ts: string;
  currentMile: number;
  currentTs: number;
}

export interface VehicleStatusProps {
  units: UnitsPref;
  vehicles: DbSupportVehicle[];
  positions: DbVehiclePosition[];
  crew: DbCrewMember[];
  rider: RiderState | null;
}

export function VehicleStatus({
  units,
  vehicles,
  positions,
  crew,
  rider,
}: VehicleStatusProps) {
  useTick(15_000); // re-render every 15s for ping-age + countdowns

  const posByVeh = new Map(positions.map((p) => [p.vehicle_id, p]));
  const crewById = new Map(crew.map((c) => [c.id, c]));

  // Separation between follow + leapfrog (the AA6.3 rule).
  const followV = vehicles.find((v) => v.kind === "follow");
  const leapV = vehicles.find((v) => v.kind === "leapfrog");
  const followP = followV ? posByVeh.get(followV.id) : null;
  const leapP = leapV ? posByVeh.get(leapV.id) : null;
  const separation =
    followP && leapP
      ? computeSeparation(
          Number(followP.lat),
          Number(followP.lng),
          Number(leapP.lat),
          Number(leapP.lng),
          {
            speedMph: rider?.speedMph,
            followPingAt: followP.ping_at,
            leapPingAt: leapP.ping_at,
          },
        )
      : null;

  return (
    <div className="flex flex-col gap-3.5">
      {separation && (
        <SeparationBanner separation={separation} units={units} />
      )}

      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-[12px] text-[color:var(--fg-4)]">
                No support vehicles configured. Add some via /admin/roster.
              </div>
            </CardBody>
          </Card>
        )}
        {vehicles.map((v) => {
          const p = posByVeh.get(v.id) ?? null;
          const driver = p?.driver_crew_id
            ? crewById.get(p.driver_crew_id)
            : null;
          const navigator = p?.navigator_crew_id
            ? crewById.get(p.navigator_crew_id)
            : null;
          const distToRider =
            p && rider
              ? haversineMiles(
                  Number(p.lat),
                  Number(p.lng),
                  rider.lat,
                  rider.lng,
                )
              : null;
          return (
            <VehicleCard
              key={v.id}
              vehicle={v}
              position={p}
              driver={driver ?? null}
              navigator={navigator ?? null}
              distToRiderMi={distToRider}
              units={units}
            />
          );
        })}

        <Card>
          <CardHead left="Rider" right={rider ? `TS${rider.currentTs}` : "—"} />
          <CardBody>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--strava-orange)]/15 text-[color:var(--strava-orange)]">
                <Bike className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[color:var(--fg-1)]">
                  Kabir Rachure · #610
                </div>
                <div className="font-mono text-[11px] text-[color:var(--fg-3)]">
                  {rider ? (
                    <>
                      mi {rider.currentMile.toFixed(1)} ·{" "}
                      {formatSpeed(rider.speedMph, units, 1)} ·{" "}
                      <span className="text-[color:var(--fg-4)]">
                        ping {fmtPingAge(rider.ts)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[color:var(--fg-4)]">
                      No ping yet — pre-race.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHead
          left="GPS sources"
          right="phone GPS · Garmin tracker · RAAM tracker"
        />
        <CardBody>
          <div className="text-[12px] text-[color:var(--fg-3)]">
            Vehicle pings come from the on-duty crew&apos;s phone. Garmin tracker is
            the secondary source per AA6.9 spec. RAAM live tracker is rider-only
            and used as fallback when phone GPS goes silent &gt;{" "}
            {VEHICLE_SEP_SOP_MINUTES} min.
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
            <SrcCell label="Phone GPS" status="primary" />
            <SrcCell label="Garmin" status="secondary" />
            <SrcCell label="RAAM tracker" status="rider-only" />
            <SrcCell label="Manual" status="fallback" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function SeparationBanner({
  separation,
  units,
}: {
  separation: ReturnType<typeof computeSeparation>;
  units: UnitsPref;
}) {
  if (separation.stale) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/40 px-4 py-3 text-[12px] text-[color:var(--fg-3)]">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-zinc-400" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[color:var(--fg-1)]">
            Vehicle GPS stale
          </div>
          <div className="text-[11px]">
            One or both vehicle pings are older than{" "}
            10 min. Separation distance can&apos;t be trusted — request a fresh
            GPS push from on-duty crew.
          </div>
        </div>
      </div>
    );
  }
  if (separation.exceedsSop) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-700 bg-red-500/15 px-4 py-3 text-[12px] text-red-200">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-red-100">
            Follow ↔ Leapfrog{" "}
            {Math.round(separation.minutes)} min apart · SOP cap{" "}
            {VEHICLE_SEP_SOP_MINUTES} min
          </div>
          <div className="font-mono text-[11px] text-red-300/80">
            distance {formatDistance(separation.miles, units, 1)} · close the
            gap before the next no-aux section
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-800/50 bg-emerald-500/10 px-4 py-3 text-[12px] text-emerald-200">
      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-emerald-100">
          Vehicles within SOP · {Math.round(separation.minutes)} min apart
        </div>
        <div className="font-mono text-[11px] text-emerald-300/80">
          distance {formatDistance(separation.miles, units, 1)} · cap{" "}
          {VEHICLE_SEP_SOP_MINUTES} min
        </div>
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  position,
  driver,
  navigator,
  distToRiderMi,
  units,
}: {
  vehicle: DbSupportVehicle;
  position: DbVehiclePosition | null;
  driver: DbCrewMember | null;
  navigator: DbCrewMember | null;
  distToRiderMi: number | null;
  units: UnitsPref;
}) {
  const kindCfg = {
    follow:   { label: "Follow",   color: "text-sky-400 border-sky-400/40 bg-sky-400/10" },
    leapfrog: { label: "Leapfrog", color: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10" },
    aux:      { label: "Aux",      color: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
    rv:       { label: "RV",       color: "text-purple-400 border-purple-400/40 bg-purple-400/10" },
    media:    { label: "Media",    color: "text-zinc-300 border-zinc-300/40 bg-zinc-300/10" },
  }[vehicle.kind];
  return (
    <Card>
      <CardHead
        left={
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[color:var(--fg-3)]" />
            {vehicle.call_sign}
          </span>
        }
        right={
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]",
              kindCfg.color,
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {kindCfg.label}
          </span>
        }
      />
      <CardBody>
        {position ? (
          <>
            <div className="grid grid-cols-2 gap-3 font-mono text-[12px]">
              <InfoPair
                label="Coord"
                value={`${Number(position.lat).toFixed(3)}, ${Number(position.lng).toFixed(3)}`}
              />
              <InfoPair
                label="Speed"
                value={
                  position.speed_mph !== null
                    ? formatSpeed(Number(position.speed_mph), units, 1)
                    : "—"
                }
              />
              <InfoPair
                label="To rider"
                value={
                  distToRiderMi !== null
                    ? formatDistance(distToRiderMi, units, 1)
                    : "—"
                }
              />
              <InfoPair label="Last ping" value={fmtPingAge(position.ping_at)} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--fg-3)]">
              <span className="rounded-sm border border-[color:var(--border)] bg-[color:var(--bg)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]">
                src · {position.source ?? "phone"}
              </span>
              {driver && (
                <span>
                  driver:{" "}
                  <span className="text-[color:var(--fg-1)]">
                    {driver.full_name}
                  </span>
                </span>
              )}
              {navigator && (
                <span>
                  nav:{" "}
                  <span className="text-[color:var(--fg-1)]">
                    {navigator.full_name}
                  </span>
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="text-[12px] text-[color:var(--fg-4)]">
            No GPS pings yet. Crew app must post to /api/vehicle/ping with
            vehicle_id={vehicle.id.slice(0, 8)}…
          </div>
        )}
        {vehicle.notes && (
          <div className="mt-3 border-t border-[color:var(--border-soft)] pt-2 text-[11px] text-[color:var(--fg-4)]">
            {vehicle.notes}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[color:var(--fg-5)]">{label}</div>
      <div className="mt-0.5 text-[color:var(--fg-1)]">{value}</div>
    </div>
  );
}

function SrcCell({
  label,
  status,
}: {
  label: string;
  status: "primary" | "secondary" | "rider-only" | "fallback";
}) {
  const cfg = {
    primary:    "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    secondary:  "border-sky-400/40 bg-sky-400/10 text-sky-300",
    "rider-only": "border-amber-400/40 bg-amber-400/10 text-amber-300",
    fallback:   "border-zinc-400/40 bg-zinc-400/10 text-zinc-300",
  }[status];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2 py-1.5",
        cfg,
      )}
    >
      <ArrowRight className="h-3 w-3" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}
