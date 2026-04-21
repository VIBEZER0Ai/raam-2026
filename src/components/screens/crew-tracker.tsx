"use client";

import { Card, CardHead } from "@/components/ui/card";
import { CrewCard } from "@/components/ui/crew-card";
import { Pill, type PillKind } from "@/components/ui/pill";
import { RouteMap } from "@/components/ui/route-map";
import { VEHICLES } from "@/lib/raam/mock-data";
import type { DbTimeStation, DbCrewMember } from "@/lib/db/queries";

export interface CrewTrackerProps {
  stations: DbTimeStation[];
  currentTs?: number;
  crew?: DbCrewMember[];
}

const DEFAULT_COLOR_BY_ROLE: Record<string, string> = {
  crew_chief: "#fc4c02",
  cc_operator: "#f59e0b",
  follow_driver: "#34d399",
  shuttle_driver: "#60a5fa",
  rv_crew: "#818cf8",
  media: "#ec4899",
  rider: "#fafafa",
  observer: "#71717a",
};

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function CrewTracker({
  stations,
  currentTs = 0,
  crew = [],
}: CrewTrackerProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHead
          left="Vehicle Fleet — 3"
          right={<span className="font-mono">all live share ACTIVE</span>}
        />
        <div className="grid gap-3 p-3 md:grid-cols-3">
          {VEHICLES.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-2 rounded-[10px] border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                    {v.call}
                  </div>
                  <div className="mt-0.5 text-[14px] font-bold">{v.name}</div>
                </div>
                <Pill kind="ON DUTY">LIVE</Pill>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-extrabold text-[#0a0a0a]"
                  style={{ background: v.drColor }}
                >
                  {v.drInit}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold">
                    {v.driver}
                  </div>
                  <div className="font-mono text-[11px] text-[color:var(--fg-4)]">
                    {v.shift} · rotate in {v.rotate}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-[color:var(--border-soft)] pt-2 font-mono text-[11px]">
                <div>
                  <div className="text-[color:var(--fg-5)]">Speed</div>
                  <div className="text-[color:var(--fg-1)]">
                    {v.speed.toFixed(1)} mph
                  </div>
                </div>
                <div>
                  <div className="text-[color:var(--fg-5)]">Distance</div>
                  <div className="text-[color:var(--fg-1)]">{v.dist}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[color:var(--fg-5)]">Near</div>
                  <div className="text-[color:var(--fg-1)]">{v.near}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead left="Live positions" right="map snapshot" />
        <RouteMap stations={stations} currentTs={currentTs} height={320} />
      </Card>

      <Card>
        <CardHead
          left={`Crew — ${crew.length}`}
          right={
            <span className="font-mono">
              roles finalising · mid-May 2026
            </span>
          }
        />
        <div className="grid gap-2.5 p-3 sm:grid-cols-2">
          {crew.length === 0 && (
            <div className="col-span-full rounded-xl border border-amber-900/60 bg-amber-500/10 p-4 text-[12px] text-amber-300">
              No crew loaded from Supabase. Run migration 0010_crew_seed.sql.
            </div>
          )}
          {crew.map((m) => (
            <CrewCard
              key={m.id}
              c={{
                id: m.id,
                initials: m.initials ?? initialsFrom(m.full_name),
                name: m.full_name,
                role: m.title ?? m.role.replace(/_/g, " "),
                color: m.color ?? DEFAULT_COLOR_BY_ROLE[m.role] ?? "#71717a",
                vehicle: prettyVehicle(m.role),
                status: "OFF" as PillKind,
                loc: "roster · pre-race",
                tag: m.phone ?? m.email ?? "—",
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function prettyVehicle(role: string): string {
  if (role === "rv_crew") return "RV";
  if (role === "follow_driver") return "Follow";
  if (role === "shuttle_driver") return "Shuttle";
  if (role === "cc_operator" || role === "crew_chief") return "Command";
  if (role === "rider") return "Bike";
  if (role === "media") return "Media";
  return "—";
}
