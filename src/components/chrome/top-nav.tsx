"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { RACE } from "@/lib/raam/race-config";
import { useTick } from "@/lib/raam/use-tick";
import { fmtDHMS, msDiff, elapsedSince, pad2 } from "@/lib/raam/format";
import { ALERTS } from "@/lib/raam/mock-data";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/",              label: "War Room",     group: "live" },
  { href: "/crew",          label: "Crew",         group: "live" },
  { href: "/time-stations", label: "Time Stations", group: "live" },
  { href: "/nutrition",     label: "Nutrition",    group: "live" },
  { href: "/weather",       label: "Weather",      group: "live" },
  { href: "/compliance",    label: "Compliance",   group: "live" },
  { href: "/pre-race",      label: "Pre-race",     group: "lifecycle" },
  { href: "/spectator",     label: "Spectator",    group: "lifecycle" },
  { href: "/admin",         label: "Admin",        group: "lifecycle" },
  { href: "/debrief",       label: "Debrief",      group: "lifecycle" },
];

export function TopNav() {
  useTick(1000);
  const pathname = usePathname();
  const [dark, setDark] = useState(true);
  const [night, setNight] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("light", !dark);
    html.classList.toggle("night", night);
  }, [dark, night]);

  useEffect(() => {
    // Auto-night 19:00-07:00 local
    const h = new Date().getHours();
    setNight(h >= 19 || h < 7);
  }, []);

  const elapsed = elapsedSince(RACE.start.datetime_utc);
  const cutoff = fmtDHMS(msDiff(RACE.finish.hard_cutoff_utc));
  const alertCount = ALERTS.filter((a) => a.sev !== "INFO").length;

  const activeHref = TABS.find((t) =>
    t.href === "/" ? pathname === "/" : pathname.startsWith(t.href),
  )?.href;

  return (
    <nav className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--bg)]">
      <div className="mx-auto flex min-h-[60px] max-w-[1440px] items-center gap-4 px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <span className="block h-[22px] w-1 bg-[color:var(--strava-orange)]" />
          <span className="text-[13px] tracking-[0.02em]">TEAM KABIR</span>
          <span className="font-mono text-[13px] font-bold text-[color:var(--strava-orange)]">
            #{RACE.racer.number}
          </span>
        </Link>

        <div className="ml-4 hidden items-center gap-3 lg:flex">
          <ClockCell
            label="Elapsed"
            value={`${elapsed.d}d ${pad2(elapsed.h)}:${pad2(elapsed.m)}:${pad2(elapsed.s)}`}
          />
          <ClockCell
            label="Cutoff"
            value={`${cutoff.d}d ${pad2(cutoff.h)}:${pad2(cutoff.m)}:${pad2(cutoff.s)}`}
            orange
          />
        </div>

        <div className="flex-1" />

        <div className="flex gap-0.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-[3px]">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                t.href === activeHref
                  ? "bg-[color:var(--strava-orange)] text-white"
                  : "text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {night && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400 bg-indigo-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              NIGHT
            </span>
          )}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] hover:border-[color:var(--border-strong)]"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {alertCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] hover:border-[color:var(--border-strong)]"
            aria-label="Toggle theme"
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="h-9 rounded-lg border-0 bg-red-500 px-3.5 text-[12px] font-extrabold tracking-[0.12em] text-white shadow-[0_0_0_2px_rgba(239,68,68,0.3)]"
          >
            SOS
          </button>
        </div>
      </div>
    </nav>
  );
}

function ClockCell({
  label,
  value,
  orange,
}: {
  label: string;
  value: string;
  orange?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[14px] font-bold tabular-nums",
          orange ? "text-[color:var(--strava-orange)]" : "text-[color:var(--fg)]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
