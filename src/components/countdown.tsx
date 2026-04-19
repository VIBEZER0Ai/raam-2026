"use client";

import { useEffect, useState } from "react";
import { RACE } from "@/lib/raam/race-config";

type Phase = "pre_race" | "racing" | "finished";

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total_ms: number;
}

function diff(to: Date): Parts {
  const ms = Math.max(0, to.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, total_ms: ms };
}

export function Countdown() {
  const start = new Date(RACE.start.datetime_utc);
  const cutoff = new Date(RACE.finish.hard_cutoff_utc);

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let phase: Phase;
  let target: Date;
  let label: string;

  if (now < start) {
    phase = "pre_race";
    target = start;
    label = "Race starts in";
  } else if (now < cutoff) {
    phase = "racing";
    target = cutoff;
    label = "Time until hard cutoff";
  } else {
    phase = "finished";
    target = cutoff;
    label = "Race closed";
  }

  const p = diff(target);
  const elapsed = diff(new Date(Date.now() + (Date.now() - start.getTime())));
  const elapsed_since_start_ms = Math.max(0, now.getTime() - start.getTime());
  const elapsed_days = Math.floor(elapsed_since_start_ms / 86_400_000);
  const elapsed_hours = Math.floor(
    (elapsed_since_start_ms % 86_400_000) / 3_600_000,
  );
  const elapsed_minutes = Math.floor(
    (elapsed_since_start_ms % 3_600_000) / 60_000,
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-zinc-400">
        <span>{label}</span>
        <span
          className={
            phase === "racing"
              ? "text-amber-400"
              : phase === "finished"
                ? "text-red-400"
                : "text-emerald-400"
          }
        >
          {phase.replace("_", " ")}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-center">
        <Cell value={p.days} label="days" />
        <Cell value={p.hours} label="hrs" />
        <Cell value={p.minutes} label="min" />
        <Cell value={p.seconds} label="sec" />
      </div>
      {phase === "racing" && (
        <div className="mt-4 text-sm text-zinc-400">
          Elapsed: {elapsed_days}d {elapsed_hours}h {elapsed_minutes}m
        </div>
      )}
      <div className="mt-4 text-xs text-zinc-500">
        Target (EDT):{" "}
        {phase === "pre_race"
          ? "Tue Jun 16, 2026 · 15:00"
          : "Mon Jun 29, 2026 · 15:00"}
      </div>
    </div>
  );
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-zinc-800/60 py-3">
      <div className="font-mono text-3xl font-bold text-zinc-50 tabular-nums">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400">
        {label}
      </div>
    </div>
  );
}
