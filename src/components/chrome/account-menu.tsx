"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Plus, Shield, Ruler } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { setTeamUnits } from "@/app/actions/units";
import { cn } from "@/lib/utils";
import type { UnitsPref } from "@/lib/units";

export interface AccountMenuMembership {
  slug: string;
  name: string;
  role: "owner" | "chief" | "crew" | "observer" | "rider";
}

export interface AccountMenuProps {
  userEmail: string;
  userFullName?: string | null;
  userInitials?: string | null;
  isPlatformAdmin: boolean;
  currentTeam: { slug: string; name: string; role: string; units: UnitsPref } | null;
  allTeams: AccountMenuMembership[];
}

export function AccountMenu({
  userEmail,
  userFullName,
  userInitials,
  isPlatformAdmin,
  currentTeam,
  allTeams,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [pendingUnits, startUnits] = useTransition();
  const flipUnits = () => {
    if (!currentTeam) return;
    const next: UnitsPref =
      currentTeam.units === "metric" ? "imperial" : "metric";
    startUnits(async () => {
      await setTeamUnits({ teamSlug: currentTeam.slug, units: next });
    });
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const initials =
    userInitials?.trim() ||
    userFullName
      ?.split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") ||
    userEmail.slice(0, 2).toUpperCase();

  const displayName = userFullName?.trim() || userEmail.split("@")[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] py-1 pl-1 pr-2 hover:border-[color:var(--border-strong)]"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-extrabold text-white"
          style={{ background: "var(--strava-orange)" }}
        >
          {initials}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-[color:var(--fg-3)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[280px] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[color:var(--border)] p-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[13px] font-extrabold text-white"
                style={{ background: "var(--strava-orange)" }}
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-[color:var(--fg-1)]">
                  {displayName}
                </div>
                <div className="truncate text-[11px] text-[color:var(--fg-3)]">
                  {userEmail}
                </div>
              </div>
            </div>
            {isPlatformAdmin && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--amber-400)]">
                <Shield className="h-3 w-3" />
                Platform admin
              </div>
            )}
          </div>

          <div className="px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
              Current team
            </div>
            {currentTeam ? (
              <Link
                href={`/team/${currentTeam.slug}`}
                onClick={() => setOpen(false)}
                className="mt-1.5 flex items-center justify-between rounded-lg bg-[color:var(--bg-row)] px-2.5 py-2 text-[13px] font-semibold hover:bg-[color:var(--bg-row)]/80"
              >
                <span className="min-w-0 flex-1 truncate">
                  {currentTeam.name}
                </span>
                <span className="ml-2 rounded-sm border border-[color:var(--border)] bg-[color:var(--bg)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-3)]">
                  {currentTeam.role}
                </span>
              </Link>
            ) : (
              <div className="mt-1.5 text-[12px] text-[color:var(--fg-3)]">
                No team yet.{" "}
                <Link
                  href="/signup"
                  className="text-[color:var(--strava-orange)]"
                >
                  Create one
                </Link>
                .
              </div>
            )}
          </div>

          {allTeams.length > 1 && (
            <div className="border-t border-[color:var(--border)] px-3 py-2">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
                Switch team
              </div>
              <div className="mt-1.5 flex flex-col gap-1">
                {allTeams
                  .filter((t) => t.slug !== currentTeam?.slug)
                  .map((t) => (
                    <Link
                      key={t.slug}
                      href={`/team/${t.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] hover:bg-[color:var(--bg-row)]"
                    >
                      <span className="min-w-0 flex-1 truncate text-[color:var(--fg-1)]">
                        {t.name}
                      </span>
                      <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-4)]">
                        {t.role}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {currentTeam && (
            <div className="border-t border-[color:var(--border)] px-3 py-2">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
                Units
              </div>
              <button
                type="button"
                onClick={flipUnits}
                disabled={pendingUnits}
                className="mt-1.5 flex w-full items-center justify-between rounded-lg bg-[color:var(--bg-row)] px-2.5 py-2 text-[12px] font-semibold hover:bg-[color:var(--bg-row)]/80 disabled:opacity-60"
              >
                <span className="flex items-center gap-2">
                  <Ruler className="h-3.5 w-3.5" />
                  {currentTeam.units === "metric" ? "Metric (km, °C)" : "Imperial (mi, °F)"}
                </span>
                <span className="rounded-sm border border-[color:var(--border)] bg-[color:var(--bg)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-3)]">
                  {pendingUnits ? "…" : "switch"}
                </span>
              </button>
            </div>
          )}

          <div className="border-t border-[color:var(--border)] px-1.5 py-1.5">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[color:var(--fg-2)] hover:bg-[color:var(--bg-row)]",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              New team
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-semibold text-[color:var(--fg-2)] hover:bg-[color:var(--bg-row)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
