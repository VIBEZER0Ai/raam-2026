"use client";

import { RACE } from "@/lib/raam/race-config";
import { useTick } from "@/lib/raam/use-tick";
import { cn } from "@/lib/utils";

export interface FooterStats {
  currentMile: number;
  currentTs: number;
  avgSpeed: number;
  elapsed: string;
  targetDelta: string;
  totalTs: number;
}

export function FooterBar({ stats }: { stats?: FooterStats | null }) {
  useTick(1000);
  // Fallback to sensible zeros so the bar renders even before first DB fetch.
  const s: FooterStats = stats ?? {
    currentMile: 0,
    currentTs: 0,
    avgSpeed: 0,
    elapsed: "—",
    targetDelta: "—",
    totalTs: RACE.course.time_stations ?? 54,
  };
  const toFin = Math.max(0, RACE.course.distance_miles - s.currentMile);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-3 overflow-x-auto border-t border-[color:var(--border)] bg-[color:var(--bg-elev)] px-3 py-2 sm:gap-4 sm:px-5 sm:py-2.5">
      <FCell label="Distance" value={`${s.currentMile.toFixed(1)} mi`} />
      <FCell label="To finish" value={`${toFin.toFixed(1)} mi`} />
      <FCell label="Avg mph" value={s.avgSpeed.toFixed(2)} />
      <FCell
        label="TS progress"
        value={`${s.currentTs}/${s.totalTs}`}
      />
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
    <div className="flex min-w-[90px] flex-none flex-col gap-0.5 sm:min-w-[120px]">
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[14px] font-bold tabular-nums sm:text-[16px]",
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
