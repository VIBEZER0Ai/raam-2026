"use client";

import { useState, useTransition } from "react";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { Pill, type PillKind } from "@/components/ui/pill";
import {
  startSleep,
  endLatestOpenBlock,
  logRecovery,
} from "@/app/actions/rest";
import type { AwakeStatus, DbRestLog } from "@/lib/db/queries";
import { fmtPingAge } from "@/lib/raam/format";
import { cn } from "@/lib/utils";

export interface SleepTrackerProps {
  status: AwakeStatus;
  history: DbRestLog[];
}

const RISK_PILL: Record<AwakeStatus["shermerRisk"], PillKind> = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
  UNKNOWN: "INFO",
};

export function SleepTracker({ status, history }: SleepTrackerProps) {
  const [pending, startTransition] = useTransition();
  const [recovery, setRecovery] = useState("");
  const [location, setLocation] = useState("");
  const [plannedMin, setPlannedMin] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const sleeping = status.open !== null;
  const sleepingForMin = sleeping
    ? Math.floor(
        (Date.now() - new Date(status.open!.started_at).getTime()) / 60_000,
      )
    : 0;

  const awakeH = Math.floor(status.awakeHours);
  const awakeM = Math.round((status.awakeHours - awakeH) * 60);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleStart = () =>
    startTransition(async () => {
      const res = await startSleep({
        location: location.trim() || undefined,
        planned_duration_min: plannedMin ? Number(plannedMin) : undefined,
      });
      if (res.ok) {
        flash("Sleep block opened.");
        setLocation("");
        setPlannedMin("");
      } else flash(`Error: ${res.error}`);
    });

  const handleEnd = () =>
    startTransition(async () => {
      const rec = recovery ? Number(recovery) : undefined;
      const res = await endLatestOpenBlock(rec);
      if (res.ok) {
        flash(rec ? `Wake logged · recovery ${rec}%` : "Wake logged.");
        setRecovery("");
      } else flash(`Error: ${res.error}`);
    });

  const handleRecoveryOnly = () =>
    startTransition(async () => {
      if (!recovery) return;
      const res = await logRecovery({ recovery_pct: Number(recovery) });
      if (res.ok) {
        flash(`Recovery ${recovery}% recorded.`);
        setRecovery("");
      } else flash(`Error: ${res.error}`);
    });

  return (
    <div className="flex flex-col gap-3.5">
      {/* Hero — status + Shermer risk */}
      <div className="grid gap-3.5 md:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Status
            </div>
            <div
              className={cn(
                "mt-2 font-mono text-[34px] font-bold leading-none",
                sleeping ? "text-indigo-400" : "text-emerald-400",
              )}
            >
              {sleeping ? `SLEEPING` : `AWAKE`}
            </div>
            <div className="mt-2 font-mono text-[13px] text-[color:var(--fg-3)]">
              {sleeping
                ? `for ${sleepingForMin}m`
                : `for ${awakeH}h ${awakeM}m`}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Recovery
            </div>
            <div
              className={cn(
                "mt-2 font-mono text-[34px] font-bold leading-none",
                status.recoveryPct === null
                  ? "text-[color:var(--fg-4)]"
                  : status.recoveryPct >= 66
                    ? "text-emerald-400"
                    : status.recoveryPct >= 33
                      ? "text-amber-400"
                      : "text-red-400",
              )}
            >
              {status.recoveryPct !== null ? `${status.recoveryPct}%` : "—"}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[color:var(--fg-4)]">
              Whoop or manual entry
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                Shermer score
              </div>
              <Pill kind={RISK_PILL[status.shermerRisk]}>
                {status.shermerRisk}
              </Pill>
            </div>
            <div
              className={cn(
                "mt-2 font-mono text-[34px] font-bold leading-none tabular-nums",
                status.shermerRisk === "CRITICAL" && "text-red-400",
                status.shermerRisk === "HIGH" && "text-orange-400",
                status.shermerRisk === "MEDIUM" && "text-amber-400",
                status.shermerRisk === "LOW" && "text-emerald-400",
              )}
            >
              {status.shermerScore !== null
                ? Math.round(status.shermerScore)
                : "—"}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[color:var(--fg-4)]">
              awake_h × (100 − recovery). 1200 HIGH · 1500 CRITICAL
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHead
          left={sleeping ? "End rest block" : "Start rest block"}
          right={
            <span className="font-mono">
              {sleeping ? `open · ${sleepingForMin}m` : "rider awake"}
            </span>
          }
        />
        <CardBody className="flex flex-col gap-3">
          {!sleeping && (
            <div className="grid gap-2.5 sm:grid-cols-[1fr_140px]">
              <input
                type="text"
                placeholder="Location (TS name, city, RV...)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--strava-orange)]"
              />
              <input
                type="number"
                min={5}
                max={240}
                placeholder="Planned min"
                value={plannedMin}
                onChange={(e) => setPlannedMin(e.target.value)}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] outline-none focus:border-[color:var(--strava-orange)]"
              />
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Recovery % (0-100)"
              value={recovery}
              onChange={(e) => setRecovery(e.target.value)}
              className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] outline-none focus:border-[color:var(--strava-orange)]"
            />
            {sleeping ? (
              <button
                type="button"
                onClick={handleEnd}
                disabled={pending}
                className={cn(
                  "rounded-lg bg-emerald-500 px-5 py-2 text-[14px] font-extrabold text-white",
                  pending && "opacity-50",
                )}
              >
                WAKE NOW
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={pending}
                className={cn(
                  "rounded-lg bg-indigo-500 px-5 py-2 text-[14px] font-extrabold text-white",
                  pending && "opacity-50",
                )}
              >
                SLEEP NOW
              </button>
            )}
          </div>
          {!sleeping && recovery && (
            <button
              type="button"
              onClick={handleRecoveryOnly}
              disabled={pending}
              className="self-start text-[11px] font-bold text-[color:var(--strava-orange)] underline"
            >
              Record recovery % only (no sleep block)
            </button>
          )}

          {toast && (
            <div
              className={cn(
                "rounded-lg border p-2 text-[12px]",
                toast.startsWith("Error")
                  ? "border-red-900/50 bg-red-500/10 text-red-300"
                  : "border-emerald-900/50 bg-emerald-500/10 text-emerald-300",
              )}
            >
              {toast}
            </div>
          )}
        </CardBody>
      </Card>

      {/* History */}
      <Card>
        <CardHead
          left={`Rest history · ${history.length}`}
          right={<span className="font-mono">newest first</span>}
        />
        <div className="flex flex-col">
          {history.length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-[color:var(--fg-4)]">
              No rest blocks logged yet. Tap SLEEP NOW when Kabir starts a nap.
            </div>
          )}
          {history.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[60px_1fr_90px_80px] gap-3 border-b border-[color:var(--border-soft)] px-4 py-3 text-[12px] last:border-b-0"
            >
              <div className="font-mono text-[11px] text-[color:var(--fg-3)]">
                {fmtPingAge(r.started_at)} ago
              </div>
              <div>
                <div className="font-semibold text-[color:var(--fg-1)]">
                  {r.location ?? (r.notes?.includes("recovery-only")
                    ? "Recovery log"
                    : "Unlabeled")}
                </div>
                {r.notes && (
                  <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
                    {r.notes}
                  </div>
                )}
              </div>
              <div className="text-right font-mono tabular-nums">
                {r.ended_at === null
                  ? "open"
                  : r.duration_min !== null
                    ? `${r.duration_min}m`
                    : "—"}
              </div>
              <div className="text-right font-mono tabular-nums">
                {r.whoop_recovery !== null ? `${r.whoop_recovery}%` : "—"}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
