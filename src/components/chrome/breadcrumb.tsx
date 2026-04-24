"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Context breadcrumb:  Ventor › <Team> › <Screen>
 *
 * Shown above main content on authenticated pages to make the operating
 * context explicit when a single account spans platform-admin + team roles.
 */
const SCREEN_TITLES: Record<string, string> = {
  "/": "War Room",
  "/crew": "Crew",
  "/time-stations": "Time Stations",
  "/nutrition": "Nutrition",
  "/weather": "Weather",
  "/compliance": "Compliance",
  "/comms": "Comms",
  "/sleep": "Sleep",
  "/pre-race": "Pre-race",
  "/spectator": "Spectator",
  "/admin": "Admin",
  "/admin/roster": "Admin · Roster",
  "/debrief": "Debrief",
  "/signup": "New team",
};

export function Breadcrumb({
  teamName,
  teamSlug,
}: {
  teamName: string | null;
  teamSlug?: string | null;
}) {
  const pathname = usePathname();
  const screen =
    SCREEN_TITLES[pathname] ??
    (pathname.startsWith("/team/") ? "Team" : "");

  // Don't render on landing / public pages (those don't reach Breadcrumb anyway
  // because layout gates on user).
  if (!teamName && !screen) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--fg-4)]"
    >
      <Link href="/" className="hover:text-[color:var(--fg-2)]">
        Ventor
      </Link>
      {teamName && (
        <>
          <ChevronRight className="h-3 w-3 text-[color:var(--fg-5)]" />
          <Link
            href={teamSlug ? `/team/${teamSlug}` : "/"}
            className="truncate text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]"
          >
            {teamName}
          </Link>
        </>
      )}
      {screen && (
        <>
          <ChevronRight className="h-3 w-3 text-[color:var(--fg-5)]" />
          <span className="truncate text-[color:var(--fg-2)]">{screen}</span>
        </>
      )}
    </nav>
  );
}
