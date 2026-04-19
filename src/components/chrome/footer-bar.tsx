"use client";

import { RACE_STATE } from "@/lib/raam/mock-data";
import { RACE } from "@/lib/raam/race-config";
import { useTick } from "@/lib/raam/use-tick";
import { cn } from "@/lib/utils";

export function FooterBar() {
  useTick(1000);
  const s = RACE_STATE;
  const toFin = RACE.course.distance_miles - s.currentMile;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-4 overflow-x-auto border-t border-[color:var(--border)] bg-[color:var(--bg-elev)] px-5 py-2.5">
      <FCell label="Distance" value={`${s.currentMile.toFixed(1)} mi`} />
      <FCell label="To finish" value={`${toFin.toFixed(1)} mi`} />
      <FCell label="Avg mph" value={s.avgSpeed.toFixed(2)} />
      <FCell label="TS progress" value={`${s.currentTs}/54`} />
      <FCell label="Elapsed" value={s.elapsed} />
      <FCell label="Δ target" value={s.targetDelta} emerald />
    </div>
  );
}

function FCell({
  label,
  value,
  emerald,
  orange,
}: {
  label: string;
  value: string;
  emerald?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="flex min-w-[120px] flex-none flex-col gap-0.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[16px] font-bold tabular-nums",
          emerald && "text-emerald-400",
          orange && "text-[color:var(--strava-orange)]",
          !emerald && !orange && "text-[color:var(--fg)]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
