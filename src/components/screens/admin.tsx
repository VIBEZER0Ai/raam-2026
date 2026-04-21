/**
 * V2 · Admin / Roster (Desktop). Tabs: Members · Devices · Audit.
 * Source: /tmp/raam-v2/v2/V2_admin.jsx.
 */

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "members", l: "Members", sub: "12 people · 5 roles" },
  { id: "devices", l: "Vehicles & devices", sub: "3 vehicles · 14 devices" },
  { id: "audit", l: "Audit log", sub: "Last 90 days" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export interface AdminProps {
  tab?: TabId;
}

export function Admin({ tab = "members" }: AdminProps) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-5 border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] px-8 py-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--strava-orange)]">
            Admin · Roster
          </div>
          <div className="mt-0.5 text-[22px] font-extrabold tracking-[-0.01em]">
            Team Kabir · RAAM 2026
          </div>
        </div>
        <div className="flex-1" />
        <button className="rounded-lg border border-[color:var(--border)] bg-transparent px-4 py-2 text-[13px] font-bold">
          Spectator: Private
        </button>
        <button className="rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white">
          + Invite
        </button>
      </div>

      <div className="flex border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] px-8">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <a
              key={t.id}
              href={`/admin?tab=${t.id}`}
              className={cn(
                "-mb-px border-b-2 px-5 py-3.5",
                active
                  ? "border-[color:var(--strava-orange)]"
                  : "border-transparent",
              )}
            >
              <div
                className={cn(
                  "text-[13px] font-extrabold",
                  active
                    ? "text-[color:var(--fg)]"
                    : "text-[color:var(--fg-3)]",
                )}
              >
                {t.l}
              </div>
              <div className="mt-0.5 text-[10px] text-[color:var(--fg-4)]">
                {t.sub}
              </div>
            </a>
          );
        })}
      </div>

      <div className="flex-1 p-6">
        {tab === "members" && <Members />}
        {tab === "devices" && <Devices />}
        {tab === "audit" && <Audit />}
      </div>
    </div>
  );
}

function Members() {
  const members = [
    { init: "SR", n: "Sapna R.", e: "sapna@teamkabir.com", role: "Chief", status: "Active", mfa: true, last: "2m" },
    { init: "VB", n: "Vishal B.", e: "vishal@zer0.ai", role: "CC", status: "Active", mfa: true, last: "now" },
    { init: "KR", n: "Kabir R.", e: "kabir@teamkabir.com", role: "Rider", status: "Active", mfa: true, last: "5m" },
    { init: "PS", n: "Priya S.", e: "priya@teamkabir.com", role: "Medical", status: "Active", mfa: true, last: "1h" },
    { init: "RM", n: "Rohan M.", e: "rohan@teamkabir.com", role: "Crew", status: "Active", mfa: false, last: "3h" },
    { init: "AV", n: "Amit V.", e: "amit@teamkabir.com", role: "Crew", status: "Active", mfa: true, last: "45m" },
    { init: "DK", n: "Dev K.", e: "dev@teamkabir.com", role: "Crew", status: "Active", mfa: true, last: "2h" },
    { init: "AT", n: "Anika T.", e: "anika@teamkabir.com", role: "Crew", status: "Active", mfa: true, last: "4h" },
    { init: "—", n: "pending@…", e: "parth@teamkabir.com", role: "Medical", status: "Invited", mfa: false, last: "never" },
    { init: "MK", n: "Maya K.", e: "maya@teamkabir.com", role: "Read-only", status: "Active", mfa: true, last: "2d" },
    { init: "RS", n: "Ravi S.", e: "ravi@sponsor.co", role: "Read-only", status: "Active", mfa: true, last: "6d" },
    { init: "—", n: "disabled@…", e: "old@teamkabir.com", role: "Crew", status: "Disabled", mfa: false, last: "90d" },
  ];
  const roleColor: Record<string, string> = {
    Chief: "text-[color:var(--strava-orange)]",
    CC: "text-indigo-400",
    Rider: "text-emerald-400",
    Medical: "text-red-400",
    Crew: "text-[color:var(--fg)]",
    "Read-only": "text-[color:var(--fg-4)]",
  };
  const roleBg: Record<string, string> = {
    Chief: "bg-[rgba(252,76,2,0.12)]",
    CC: "bg-indigo-500/12",
    Rider: "bg-emerald-500/12",
    Medical: "bg-red-500/12",
    Crew: "bg-[color:var(--bg-row)]",
    "Read-only": "bg-[color:var(--bg-row)]",
  };
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-3">
        <input
          placeholder="Search members…"
          className="flex-1 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-row)] px-3 py-2 text-[12px] text-[color:var(--fg)] outline-none"
        />
        {["All", "Chief", "CC", "Crew", "Medical", "Rider", "Read-only"].map(
          (r, i) => (
            <span
              key={r}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-bold",
                i === 0
                  ? "border-[color:var(--fg)] bg-[color:var(--fg)] text-[color:var(--bg)]"
                  : "border-[color:var(--border)] bg-transparent text-[color:var(--fg-3)]",
              )}
            >
              {r}
            </span>
          ),
        )}
      </div>
      <div className="grid grid-cols-[36px_2fr_1fr_1fr_100px_80px_80px] gap-3 border-b border-[color:var(--border-soft)] bg-[color:var(--bg-row)]/50 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
        <div />
        <div>Name</div>
        <div>Email</div>
        <div>Role</div>
        <div>Status</div>
        <div>MFA</div>
        <div>Last seen</div>
      </div>
      {members.map((m, i) => (
        <div
          key={i}
          className={cn(
            "grid grid-cols-[36px_2fr_1fr_1fr_100px_80px_80px] items-center gap-3 px-5 py-3 text-[12px]",
            i < members.length - 1 &&
              "border-b border-[color:var(--border-soft)]",
            m.status === "Disabled" && "opacity-50",
          )}
        >
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold text-white",
              m.status === "Invited"
                ? "bg-[color:var(--fg-4)]"
                : "bg-[color:var(--strava-orange)]",
            )}
          >
            {m.init}
          </div>
          <div
            className={cn(
              "font-bold",
              m.status === "Invited"
                ? "italic text-[color:var(--fg-3)]"
                : "text-[color:var(--fg)]",
            )}
          >
            {m.n}
          </div>
          <div className="font-mono text-[11px] text-[color:var(--fg-3)]">
            {m.e}
          </div>
          <div>
            <span
              className={cn(
                "rounded px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.05em]",
                roleBg[m.role],
                roleColor[m.role],
              )}
            >
              {m.role}
            </span>
          </div>
          <div>
            <span
              className={cn(
                "text-[10px] font-extrabold uppercase tracking-[0.05em]",
                m.status === "Active" && "text-emerald-400",
                m.status === "Invited" && "text-amber-400",
                m.status === "Disabled" && "text-[color:var(--fg-4)]",
              )}
            >
              ● {m.status}
            </span>
          </div>
          <div
            className={cn(
              "text-[11px] font-bold",
              m.mfa ? "text-emerald-400" : "text-red-400",
            )}
          >
            {m.mfa ? "✓ On" : "✕ Off"}
          </div>
          <div className="font-mono text-[11px] text-[color:var(--fg-3)]">
            {m.last}
          </div>
        </div>
      ))}
    </Card>
  );
}

function Devices() {
  const vehicles = [
    { call: "ALPHA-1", name: "Follow Vehicle", driver: "Aditya R.", dist: "0.3 mi behind", fuel: "full", live: "ACTIVE" },
    { call: "BRAVO-2", name: "Shuttle", driver: "Ravi K.", dist: "11.6 mi back", fuel: "3/4", live: "ACTIVE" },
    { call: "CHARLIE-3", name: "RV / War Room", driver: "Sunil M.", dist: "4.2 mi back", fuel: "half", live: "ACTIVE" },
  ];
  const devices = [
    { t: "iPad", n: "Chase 1 iPad", u: "Van 1", stat: "Online", last: "1m" },
    { t: "iPad", n: "Chase 2 iPad", u: "Van 2", stat: "Online", last: "2m" },
    { t: "iPad", n: "RV iPad", u: "RV-1", stat: "Online", last: "3m" },
    { t: "Phone", n: "Sapna iPhone", u: "Sapna", stat: "Online", last: "1m" },
    { t: "Phone", n: "Neha iPhone", u: "Neha", stat: "Online", last: "18m" },
    { t: "Phone", n: "Kabir Garmin", u: "Kabir", stat: "Online", last: "5s" },
    { t: "Phone", n: "Rohan iPhone", u: "Rohan", stat: "Offline", last: "4h" },
    { t: "Tracker", n: "RAAM GPS #610", u: "Kabir", stat: "Online", last: "30s" },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="border-b border-[color:var(--border)] px-5 py-3.5 text-[13px] font-extrabold">
          Vehicles
        </div>
        {vehicles.map((v, i) => (
          <div
            key={v.call}
            className={cn(
              "px-5 py-3.5",
              i < vehicles.length - 1 &&
                "border-b border-[color:var(--border-soft)]",
            )}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--strava-orange)]">
                {v.call}
              </span>
              <span className="text-[14px] font-extrabold">{v.name}</span>
              <span className="ml-auto rounded bg-emerald-500/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-emerald-400">
                {v.live}
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-3">
              {[
                { k: "Driver", v: v.driver },
                { k: "Distance", v: v.dist },
                { k: "Fuel", v: v.fuel },
              ].map((r) => (
                <div key={r.k}>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
                    {r.k}
                  </div>
                  <div className="mt-0.5 text-[12px] font-semibold">{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <div className="flex items-center border-b border-[color:var(--border)] px-5 py-3.5">
          <span className="text-[13px] font-extrabold">Devices</span>
          <span className="ml-auto font-mono text-[11px] text-[color:var(--fg-3)]">
            14 active · 2 offline
          </span>
        </div>
        {devices.map((d, i) => (
          <div
            key={i}
            className={cn(
              "grid grid-cols-[60px_1fr_1fr_80px_60px] items-center gap-2.5 px-5 py-2.5 text-[12px]",
              i < devices.length - 1 &&
                "border-b border-[color:var(--border-soft)]",
            )}
          >
            <span className="rounded bg-[color:var(--bg-row)] px-1.5 py-0.5 text-center text-[9px] font-extrabold uppercase tracking-[0.05em] text-[color:var(--fg-3)]">
              {d.t}
            </span>
            <span className="font-bold">{d.n}</span>
            <span className="text-[color:var(--fg-3)]">{d.u}</span>
            <span
              className={cn(
                "text-[10px] font-extrabold",
                d.stat === "Online"
                  ? "text-emerald-400"
                  : "text-[color:var(--fg-4)]",
              )}
            >
              ● {d.stat}
            </span>
            <span className="font-mono text-[10px] text-[color:var(--fg-3)]">
              {d.last}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Audit() {
  const logs = [
    { t: "09:41", d: "Apr 20", who: "Sapna R.", act: "Invited parth@teamkabir.com as Medical", sev: "info" },
    { t: "09:12", d: "Apr 20", who: "Neha P.", act: "Acked alert CRIT-0331 (heat spike TS14)", sev: "info" },
    { t: "08:55", d: "Apr 20", who: "System", act: "Auto-disabled old@teamkabir.com (no login 90d)", sev: "warn" },
    { t: "08:02", d: "Apr 20", who: "Sapna R.", act: "Changed spectator privacy to Private", sev: "warn" },
    { t: "07:30", d: "Apr 20", who: "Kabir R.", act: "Updated nutrition baseline (carb 88 → 90 g/h)", sev: "info" },
    { t: "22:14", d: "Apr 19", who: "Rohan M.", act: "Failed login (×3) from 174.22.x.x", sev: "bad" },
    { t: "22:15", d: "Apr 19", who: "System", act: "MFA challenge sent to Rohan M.", sev: "info" },
    { t: "18:40", d: "Apr 19", who: "Sapna R.", act: "Changed Amit V. role Crew → Driver", sev: "info" },
    { t: "14:22", d: "Apr 19", who: "Priya S.", act: "Added incident INC-0087 (minor road rash TS8)", sev: "info" },
    { t: "10:05", d: "Apr 19", who: "Sapna R.", act: "Published plan v3", sev: "info" },
  ];
  const dot = (s: string) =>
    s === "bad"
      ? "bg-red-400"
      : s === "warn"
        ? "bg-amber-400"
        : "bg-indigo-400";
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-3">
        <input
          placeholder="Filter audit log…"
          className="flex-1 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-row)] px-3 py-1.5 text-[12px] text-[color:var(--fg)] outline-none"
        />
        {["All", "Info", "Warn", "Critical", "System"].map((r, i) => (
          <span
            key={r}
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11px] font-bold",
              i === 0
                ? "border-[color:var(--fg)] bg-[color:var(--fg)] text-[color:var(--bg)]"
                : "border-[color:var(--border)] bg-transparent text-[color:var(--fg-3)]",
            )}
          >
            {r}
          </span>
        ))}
        <button className="rounded-md border border-[color:var(--border)] bg-transparent px-3 py-1.5 text-[11px] text-[color:var(--fg-3)]">
          Export CSV
        </button>
      </div>
      {logs.map((l, i) => (
        <div
          key={i}
          className={cn(
            "grid grid-cols-[6px_80px_120px_1fr] items-center gap-3 px-5 py-3",
            i < logs.length - 1 && "border-b border-[color:var(--border-soft)]",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", dot(l.sev))} />
          <span className="font-mono text-[11px] text-[color:var(--fg-3)]">
            {l.d} {l.t}
          </span>
          <span className="text-[12px] font-bold">{l.who}</span>
          <span className="text-[12px] text-[color:var(--fg)]">{l.act}</span>
        </div>
      ))}
    </Card>
  );
}
