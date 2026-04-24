"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { RACE } from "@/lib/raam/race-config";
import { useTick } from "@/lib/raam/use-tick";
import { fmtDHMS, msDiff, elapsedSince, pad2 } from "@/lib/raam/format";
import { SosButton } from "@/components/chrome/sos-button";
import { MobileNav } from "@/components/chrome/mobile-nav";
import { GroupedNav } from "@/components/chrome/grouped-nav";
import {
  AccountMenu,
  type AccountMenuMembership,
} from "@/components/chrome/account-menu";
import { cn } from "@/lib/utils";

const LEGACY_TABS_IGNORED = [
  { href: "/",              label: "War Room",     group: "live" },
  { href: "/crew",          label: "Crew",         group: "live" },
  { href: "/time-stations", label: "Time Stations", group: "live" },
  { href: "/nutrition",     label: "Nutrition",    group: "live" },
  { href: "/weather",       label: "Weather",      group: "live" },
  { href: "/compliance",    label: "Compliance",   group: "live" },
  { href: "/comms",         label: "Comms",        group: "live" },
  { href: "/sleep",         label: "Sleep",        group: "live" },
  { href: "/pre-race",      label: "Pre-race",     group: "lifecycle" },
  { href: "/spectator",     label: "Spectator",    group: "lifecycle" },
  { href: "/admin",         label: "Admin",        group: "lifecycle" },
  { href: "/debrief",       label: "Debrief",      group: "lifecycle" },
];

export interface TopNavProps {
  userEmail?: string | null;
  userFullName?: string | null;
  userInitials?: string | null;
  isPlatformAdmin?: boolean;
  alertCount?: number;
  currentTeam?: { slug: string; name: string; role: string } | null;
  allTeams?: AccountMenuMembership[];
}

export function TopNav({
  userEmail,
  userFullName = null,
  userInitials = null,
  isPlatformAdmin = false,
  alertCount = 0,
  currentTeam = null,
  allTeams = [],
}: TopNavProps) {
  useTick(1000);
  // Read persisted choice on mount — falls back to system preference, then dark.
  const [dark, setDark] = useState<boolean>(() => true);
  const [night, setNight] = useState(false);

  // Load saved theme + auto-night on mount
  useEffect(() => {
    const saved = typeof window !== "undefined"
      ? localStorage.getItem("ventor.theme")
      : null;
    if (saved === "light") setDark(false);
    else if (saved === "dark") setDark(true);
    else if (typeof window !== "undefined"
             && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
      setDark(false);
    }
    const h = new Date().getHours();
    setNight(h >= 19 || h < 7);
  }, []);

  // Apply to <html>. Night only amplifies dark; in light mode night is off.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("light", !dark);
    html.classList.toggle("night", dark && night);
    if (typeof window !== "undefined") {
      localStorage.setItem("ventor.theme", dark ? "dark" : "light");
    }
  }, [dark, night]);

  const elapsed = elapsedSince(RACE.start.datetime_utc);
  const cutoff = fmtDHMS(msDiff(RACE.finish.hard_cutoff_utc));

  return (
    <nav className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--bg)]">
      <div className="mx-auto flex min-h-[60px] max-w-[1440px] items-center gap-4 px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <span className="block h-[22px] w-1 bg-[color:var(--strava-orange)]" />
          <span className="text-[13px] tracking-[0.04em]">VENTOR</span>
          <span className="hidden text-[11px] font-semibold text-[color:var(--fg-4)] sm:inline">
            · Team Kabir
          </span>
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

        {/* Desktop grouped nav (md+) — hidden on phones */}
        <GroupedNav />

        <div className="flex items-center gap-1.5">
          {night && (
            <span className="hidden items-center gap-1.5 rounded-full border border-indigo-400 bg-indigo-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              NIGHT
            </span>
          )}
          <MobileNav />
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
          <SosButton />
          {userEmail && (
            <AccountMenu
              userEmail={userEmail}
              userFullName={userFullName}
              userInitials={userInitials}
              isPlatformAdmin={isPlatformAdmin}
              currentTeam={currentTeam}
              allTeams={allTeams}
            />
          )}
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
