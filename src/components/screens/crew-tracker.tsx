"use client";

import { Card, CardHead } from "@/components/ui/card";
import { CrewCard } from "@/components/ui/crew-card";
import { Pill, type PillKind } from "@/components/ui/pill";
import { RouteMap } from "@/components/ui/route-map";
import { CREW, VEHICLES } from "@/lib/raam/mock-data";
import type { DbTimeStation } from "@/lib/db/queries";

export interface CrewTrackerProps {
  stations: DbTimeStation[];
  currentTs?: number;
}

export function CrewTracker({ stations, currentTs = 0 }: CrewTrackerProps) {
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
        <CardHead left="Crew — 10" right="AirTag + Live Share" />
        <div className="grid gap-2.5 p-3 sm:grid-cols-2">
          {CREW.map((c) => (
            <CrewCard
              key={c.id}
              c={{ ...c, status: c.status as PillKind }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
