"use client";

import { useTick } from "@/lib/raam/use-tick";
import { fmtDHMS, msDiff, pad2 } from "@/lib/raam/format";
import { RACE } from "@/lib/raam/race-config";
import {
  ALERTS,
  CREW,
  RACE_STATE,
  WEATHER_NOW,
} from "@/lib/raam/mock-data";
import type { DbTimeStation, DbTargetPlan } from "@/lib/db/queries";
import { AlertBanner } from "@/components/chrome/alert-banner";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { StatCard } from "@/components/ui/stat-card";
import { TSBadge } from "@/components/ui/ts-badge";
import { CrewCard } from "@/components/ui/crew-card";
import { ProgressRow } from "@/components/ui/progress-row";
import { MiniMap } from "@/components/ui/mini-map";

export interface WarRoomProps {
  stations: DbTimeStation[];
  targets: DbTargetPlan[];
}

export function WarRoom({ stations, targets }: WarRoomProps) {
  useTick(1000);
  const s = RACE_STATE;
  const cutoff = fmtDHMS(msDiff(RACE.finish.hard_cutoff_utc));
  const nextTs = stations[s.currentTs + 1];
  const targetByTs = new Map(targets.map((t) => [t.ts_num, t]));
  const tgt = targetByTs.get(s.currentTs);
  const criticalAlert = ALERTS.find((a) => a.sev === "CRITICAL");
  const softCutoffs = new Set<number>(
    RACE.intermediate_checkpoints.filter((c) => !c.hard).map((c) => c.ts),
  );
  const hardCutoffs = new Set<number>(
    RACE.intermediate_checkpoints.filter((c) => c.hard).map((c) => c.ts),
  );

  return (
    <div className="flex flex-col gap-3.5">
      {criticalAlert && <AlertBanner alert={criticalAlert} />}

      {/* Hero — cutoff · speed · next TS */}
      <div className="grid gap-3.5 md:grid-cols-3">
        <StatCard
          eyebrow="Cutoff · Atlantic City"
          valueKind="orange"
          value={
            <>
              {pad2(cutoff.d)}
              <span className="text-[16px] font-medium text-[color:var(--fg-4)]"> d </span>
              {pad2(cutoff.h)}
              <span className="text-[16px] font-medium text-[color:var(--fg-4)]"> h</span>
            </>
          }
          sub={`${pad2(cutoff.m)}m ${pad2(cutoff.s)}s · hard · Jun 29 15:00 EDT`}
        />
        <StatCard
          eyebrow="Current speed"
          valueKind="orange"
          live
          value={
            <>
              {s.currentSpeed.toFixed(1)}
              <span className="text-[16px] font-medium text-[color:var(--fg-4)]"> mph</span>
            </>
          }
          sub="+0.4 vs 2023 · seg avg 13.82"
          subKind="emerald"
          progress={68}
        />
        <StatCard
          eyebrow={nextTs ? `Next TS · ${nextTs.ts_num}` : "Next TS"}
          value={
            <span className="text-[24px]">
              {nextTs ? `${nextTs.name}, ${nextTs.state}` : "—"}
            </span>
          }
          sub={
            nextTs
              ? `mi ${Number(nextTs.mile_total).toFixed(1)} · ETA ${tgt?.target_arr_time ?? "—"} · RRS 30:00`
              : "pending"
          }
        />
      </div>

      {/* Mid row — next 4 TS + alerts + weather */}
      <div className="grid gap-3.5 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHead left="Time Stations — Next 4" right={`${s.currentTs}/54`} />
          <div className="flex flex-col">
            {stations.slice(s.currentTs, s.currentTs + 4).map((t, i) => {
              const isCurrent = i === 0;
              const isHard = hardCutoffs.has(t.ts_num);
              const isSoft = softCutoffs.has(t.ts_num);
              const badgeKind = isCurrent
                ? "current"
                : isHard
                  ? "danger"
                  : isSoft
                    ? "cp"
                    : "up";
              const rowClass = [
                "flex items-center gap-3 px-4 py-2.5 border-b border-[color:var(--border-soft)] last:border-b-0",
                isCurrent && "bg-[rgba(252,76,2,0.06)]",
                isHard && "shadow-[inset_3px_0_0_var(--red-500)]",
                isSoft && !isHard && "shadow-[inset_3px_0_0_var(--amber-400)]",
              ]
                .filter(Boolean)
                .join(" ");
              const tgtRow = targetByTs.get(t.ts_num);
              return (
                <div key={t.ts_num} className={rowClass}>
                  <TSBadge num={t.ts_num} kind={badgeKind} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--fg-1)]">
                      {t.name}, {t.state}
                      {isSoft && <Pill kind="AMBER">SOFT CUTOFF</Pill>}
                      {isHard && <Pill kind="CRITICAL">HARD CUTOFF</Pill>}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[color:var(--fg-4)]">
                      mi {Number(t.mile_total).toFixed(1)} · 2023: {t.split_2023_elapsed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[11px] text-emerald-400">
                      target {tgtRow?.target_arr_time ?? "—"}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[color:var(--fg-4)]">
                      {(Number(t.mile_total) - s.currentMile).toFixed(1)} mi
                      away
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card>
            <CardHead left="Active alerts" right={`${ALERTS.length} open`} />
            <div className="flex flex-col">
              {ALERTS.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 border-b border-[color:var(--border-soft)] px-3.5 py-2.5 last:border-b-0"
                >
                  <Pill kind={a.sev} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-[color:var(--fg-1)]">
                      {a.title}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-[color:var(--fg-4)]">
                      {a.meta}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-[color:var(--border)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]"
                  >
                    ACK
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead
              left="Weather · rider position"
              right={<span className="font-mono">TS14 Cortez</span>}
            />
            <CardBody className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                  Temp
                </div>
                <div className="mt-1 font-mono text-[24px] font-bold tabular-nums">
                  {WEATHER_NOW.temp}°F
                </div>
                <div className="font-mono text-[11px] text-[color:var(--fg-4)]">
                  feels {WEATHER_NOW.feels}°F · {WEATHER_NOW.cond}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                  Wind
                </div>
                <div className="mt-1 font-mono text-[24px] font-bold tabular-nums text-amber-400">
                  {WEATHER_NOW.wind} mph
                  <span
                    className="ml-2 inline-block text-amber-400"
                    style={{ transform: `rotate(${WEATHER_NOW.windDeg}deg)` }}
                  >
                    ↑
                  </span>
                </div>
                <div className="font-mono text-[11px] text-red-400">
                  headwind · −1.8 mph pace
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Bottom — crew, nutrition, vitals */}
      <div className="grid gap-3.5 md:grid-cols-3">
        <Card>
          <CardHead left="Crew · 10" right="live" />
          <div className="flex flex-col gap-2 p-2.5">
            {CREW.slice(0, 4).map((c) => (
              <CrewCard
                key={c.id}
                c={{ ...c, status: c.status as Parameters<typeof CrewCard>[0]["c"]["status"] }}
              />
            ))}
            <button
              type="button"
              className="mt-0.5 rounded-full border border-[color:var(--border)] py-1.5 text-[12px] font-semibold text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]"
            >
              Open full crew board →
            </button>
          </div>
        </Card>

        <Card>
          <CardHead left="Nutrition · last 1h" right="phase: Rockies" />
          <CardBody>
            <ProgressRow label="Carbs" value={70} max={90} unit="g" color="#34d399" />
            <ProgressRow label="Water" value={465} max={750} unit="ml" color="#fbbf24" />
            <ProgressRow label="Sodium" value={440} max={1000} unit="mg" color="#f87171" />
            <ProgressRow label="Caffeine" value={80} max={200} unit="mg" color="#818cf8" />
            <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-[rgba(154,52,18,0.6)] bg-orange-400/10 px-3 py-2 text-orange-200">
              <span className="rounded-sm bg-orange-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1c1917]">
                FEED
              </span>
              <span className="text-[12px] font-semibold">
                Prep feed · TS15 · 60g + 500ml + 400mg Na
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead left="Rider vitals" right="#610 Kabir" />
          <CardBody className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <VitalCell label="HR" value="138" unit="bpm" />
              <VitalCell label="Power" value="216" unit="W" />
              <VitalCell label="Recovery" value="52" unit="%" amber />
              <VitalCell label="Sleep 24h" value="1h 12m" unit="" />
            </div>
            <div className="flex items-center gap-2 rounded-[10px] border border-[rgba(49,46,129,0.6)] bg-indigo-500/10 px-3 py-2 text-indigo-200">
              <span className="rounded-sm bg-indigo-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0b0820]">
                SLEEP #4
              </span>
              <span className="text-[12px] font-semibold">
                Ulysses KS · ETA Day 4 14:00 · 45 min · NEVER skip
              </span>
            </div>
            <div className="font-mono text-[11px] text-[color:var(--fg-4)]">
              Shermer&apos;s risk: <span className="text-emerald-400">LOW</span> (22h awake × 52% recovery)
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Location panel */}
      <Card>
        <CardHead
          left="Location tracking"
          right={
            <span className="font-mono">
              AirTag · Find My · Live Share · RAAM tracker
            </span>
          }
        />
        <MiniMap />
        <div className="flex flex-wrap gap-2 border-t border-[color:var(--border)] px-3.5 py-2.5">
          <Pill kind="ON DUTY">Kabir live</Pill>
          <Pill kind="DRIVING">Follow 0.3 mi</Pill>
          <Pill kind="OFF">Shuttle 11.6 mi</Pill>
          <Pill kind="OFF">RV 4.2 mi</Pill>
          <Pill kind="CRITICAL">Rahul AirTag OFFLINE 34m</Pill>
          <button
            type="button"
            className="ml-auto rounded-full border border-[color:var(--border)] px-3 py-1 text-[12px] font-semibold text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]"
          >
            Open full map →
          </button>
        </div>
      </Card>
    </div>
  );
}

function VitalCell({
  label,
  value,
  unit,
  amber,
}: {
  label: string;
  value: string;
  unit: string;
  amber?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-[22px] font-bold tabular-nums ${amber ? "text-amber-400" : ""}`}
      >
        {value}
        {unit && (
          <span className="text-[11px] font-normal text-[color:var(--fg-4)]">
            {" "}
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
