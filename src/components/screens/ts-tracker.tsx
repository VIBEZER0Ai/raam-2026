"use client";

import { useState } from "react";
import { TIME_STATIONS } from "@/lib/raam/time-stations";
import { TARGETS, RACE_STATE } from "@/lib/raam/mock-data";
import { RACE } from "@/lib/raam/race-config";
import { Card, CardHead } from "@/components/ui/card";
import { TSBadge } from "@/components/ui/ts-badge";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Upcoming", "Passed", "Danger", "Cutoffs"] as const;
type Filter = (typeof FILTERS)[number];

export function TSTracker() {
  const [filter, setFilter] = useState<Filter>("All");
  const softCutoffs = new Set<number>(
    RACE.intermediate_checkpoints.filter((c) => !c.hard).map((c) => c.ts),
  );
  const hardCutoffs = new Set<number>(
    RACE.intermediate_checkpoints.filter((c) => c.hard).map((c) => c.ts),
  );

  const rows = TIME_STATIONS.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Upcoming") return t.ts_num > RACE_STATE.currentTs;
    if (filter === "Passed") return t.ts_num < RACE_STATE.currentTs;
    if (filter === "Danger")
      return t.avg_this_ts_2023 > 0 && t.avg_this_ts_2023 < 8;
    if (filter === "Cutoffs")
      return softCutoffs.has(t.ts_num) || hardCutoffs.has(t.ts_num);
    return true;
  });

  return (
    <div className="flex flex-col gap-3.5">
      {/* Sticky cutoff meter */}
      <Card>
        <CardHead
          left="Cutoff meter — Hard cutoff 288h"
          right={<span className="font-mono">Kabir at mi {RACE_STATE.currentMile.toFixed(1)}</span>}
        />
        <div className="p-4">
          <div className="relative h-3 overflow-hidden rounded-full bg-[color:var(--bg-row)]">
            <span
              className="block h-full bg-[color:var(--strava-orange)]"
              style={{
                width: `${(RACE_STATE.currentMile / RACE.course.distance_miles) * 100}%`,
              }}
            />
            {RACE.intermediate_checkpoints.map((c) => {
              const ts = TIME_STATIONS.find((t) => t.ts_num === c.ts);
              if (!ts) return null;
              const pct = (Number(ts.mile_total) / RACE.course.distance_miles) * 100;
              return (
                <span
                  key={c.ts}
                  className={cn(
                    "absolute top-0 h-full w-[2px]",
                    c.hard ? "bg-red-500" : "bg-amber-400",
                  )}
                  style={{ left: `${pct}%` }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-[color:var(--fg-4)]">
            <span>TS0 Oceanside</span>
            <span className="text-amber-400">TS15 Durango +81h</span>
            <span className="text-amber-400">TS35 Mississippi +192h</span>
            <span className="text-red-400">TS54 Finish +288h HARD</span>
          </div>
        </div>
      </Card>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto py-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold",
              filter === f
                ? "border-[color:var(--strava-orange)] bg-[color:var(--strava-orange)] text-white"
                : "border-[color:var(--border)] bg-transparent text-[color:var(--fg-3)]",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        <CardHead left={`${rows.length} Time Stations`} right={`${filter} filter`} />
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="grid grid-cols-[60px_1fr_90px_100px_100px_90px_110px] gap-3 border-b border-[color:var(--border)] bg-[rgba(39,39,42,0.5)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--fg-3)]">
              <div>TS</div>
              <div>Station</div>
              <div className="text-right">Mile</div>
              <div className="text-right">2023 split</div>
              <div className="text-right">2023 avg</div>
              <div className="text-right">Low</div>
              <div className="text-right">2026 target</div>
            </div>
            {rows.map((t) => {
              const isCurrent = t.ts_num === RACE_STATE.currentTs;
              const isHard = hardCutoffs.has(t.ts_num);
              const isSoft = softCutoffs.has(t.ts_num);
              const isDanger = t.avg_this_ts_2023 > 0 && t.avg_this_ts_2023 < 8;
              const badgeKind = isCurrent
                ? "current"
                : isHard
                  ? "danger"
                  : isSoft
                    ? "cp"
                    : t.ts_num < RACE_STATE.currentTs
                      ? "passed"
                      : "up";
              const target = TARGETS[t.ts_num];

              return (
                <div
                  key={t.ts_num}
                  className={cn(
                    "grid grid-cols-[60px_1fr_90px_100px_100px_90px_110px] gap-3 border-b border-[color:var(--border-soft)] px-4 py-2 text-[12px]",
                    isCurrent && "bg-[rgba(252,76,2,0.06)]",
                    isSoft && !isHard && "shadow-[inset_3px_0_0_var(--amber-400)]",
                    isHard && "shadow-[inset_3px_0_0_var(--red-500)]",
                  )}
                >
                  <TSBadge num={t.ts_num} kind={badgeKind} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate font-semibold text-[color:var(--fg-1)]">
                      {t.name}, {t.state}
                      {isSoft && <Pill kind="AMBER">SOFT</Pill>}
                      {isHard && <Pill kind="CRITICAL">HARD</Pill>}
                      {isDanger && !isSoft && !isHard && (
                        <Pill kind="WARN">DANGER</Pill>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    {Number(t.mile_total).toFixed(1)}
                  </div>
                  <div className="text-right font-mono tabular-nums text-[color:var(--fg-2)]">
                    {t.split_2023_elapsed}
                  </div>
                  <div className="text-right font-mono tabular-nums text-[color:var(--fg-3)]">
                    {Number(t.avg_speed_2023).toFixed(2)}
                  </div>
                  <div
                    className={cn(
                      "text-right font-mono tabular-nums",
                      isDanger ? "text-red-400" : "text-[color:var(--fg-4)]",
                    )}
                  >
                    {t.avg_this_ts_2023 > 0
                      ? Number(t.avg_this_ts_2023).toFixed(1)
                      : "—"}
                  </div>
                  <div className="text-right font-mono tabular-nums text-emerald-400">
                    {target ? `${target.time.replace(/\s[A-Z]{3}$/, "")}` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
