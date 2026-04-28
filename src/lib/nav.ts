/**
 * Ventor navigation taxonomy.
 *
 * Three phase-based groups + the always-on War Room primary:
 *
 *   War Room  — the live dashboard (home). Always a direct link.
 *   Operate   — during-race tabs (crew, time stations, nutrition, etc.)
 *   Plan      — before/after race tabs (pre-race checklist, debrief)
 *   Team      — management + public (admin, roster, spectator, settings)
 */

export interface NavItem {
  href: string;
  label: string;
  desc?: string;
}

export interface NavGroup {
  id: "operate" | "plan" | "team";
  label: string;
  items: NavItem[];
}

/** Primary single link at the top level (most-used page). */
export const NAV_PRIMARY: NavItem = {
  href: "/",
  label: "War Room",
  desc: "Live dashboard",
};

/** Grouped dropdown entries. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "operate",
    label: "Operate",
    items: [
      { href: "/crew", label: "Crew", desc: "On-duty roster + shifts" },
      { href: "/vehicles", label: "Vehicles", desc: "Follow + leapfrog status" },
      { href: "/time-stations", label: "Time Stations", desc: "Split tracker vs target" },
      { href: "/nutrition", label: "Nutrition", desc: "Fueling log + hourly targets" },
      { href: "/sleep", label: "Sleep", desc: "Rest plan + Whoop overlay" },
      { href: "/compliance", label: "Compliance", desc: "Rule evaluations + penalties" },
      { href: "/comms", label: "Comms", desc: "Discord + crew channel" },
      { href: "/weather", label: "Weather", desc: "Ahead-of-rider forecast" },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    items: [
      { href: "/pre-race", label: "Pre-race", desc: "Checklist + cut-offs" },
      { href: "/debrief", label: "Debrief", desc: "Post-race review" },
    ],
  },
  {
    id: "team",
    label: "Team",
    items: [
      { href: "/admin", label: "Admin", desc: "Team settings + overview" },
      { href: "/admin/roster", label: "Roster", desc: "Add, edit, deactivate crew" },
      { href: "/spectator", label: "Spectator", desc: "Public live tracker" },
    ],
  },
];

/** All nav items flat — used for hamburger drawer + breadcrumb resolution. */
export const NAV_FLAT: NavItem[] = [
  NAV_PRIMARY,
  ...NAV_GROUPS.flatMap((g) => g.items),
];

/** Return the group containing a given pathname (or null). */
export function findActiveGroup(pathname: string): NavGroup | null {
  return (
    NAV_GROUPS.find((g) =>
      g.items.some((i) =>
        i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
      ),
    ) ?? null
  );
}

export function findActiveItem(pathname: string): NavItem | null {
  if (pathname === "/") return NAV_PRIMARY;
  return (
    NAV_FLAT.find((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    ) ?? null
  );
}
