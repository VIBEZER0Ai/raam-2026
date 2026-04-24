/**
 * V2 · Spectator / family view. Public-safe only: position, pace, next TS,
 * milestones, cheers. No medical, no crew PII, no SOS.
 * Source: /tmp/raam-v2/v2/V2_spectator.jsx.
 */

import { cn } from "@/lib/utils";
import { RouteMap } from "@/components/ui/route-map";
import type { DbTimeStation } from "@/lib/db/queries";

const CHEERS = [
  { n: "Rahul (Dad)", t: "2m", m: "Go Kabir! We're watching every mile from Pune." },
  { n: "Anonymous", t: "8m", m: "Just donated $50 — sending you a tailwind!" },
  { n: "Sarah & family", t: "15m", m: "Watching with the kids, they made signs." },
  { n: "Riders of SF", t: "22m", m: "The whole club is cheering you through Kansas." },
  { n: "Maya K.", t: "28m", m: "Sending strength — you got this brother." },
  { n: "Anonymous", t: "35m", m: "Chai and prayers from Bangalore." },
];

const MILESTONES = [
  { day: "D1", ts: "20:15", loc: "Borrego Springs", evt: "First sunset · temps hit 42°C", state: "done" },
  { day: "D3", ts: "04:12", loc: "Flagstaff AZ", evt: "Crossed the Continental Divide", state: "done" },
  { day: "D4", ts: "14:50", loc: "Ulysses KS", evt: "Hit 1,000 miles · team anchor sleep", state: "done" },
  { day: "D6", ts: "22:30", loc: "Camdenton MO", evt: "2/3 of the race done", state: "done" },
  { day: "D7", ts: "NOW", loc: "Columbia MO", evt: "You are here", state: "live" },
  { day: "D9", ts: "—", loc: "Gettysburg PA", evt: "100 miles to finish", state: "upcoming" },
  { day: "D11", ts: "—", loc: "Atlantic City NJ", evt: "Finish line", state: "upcoming" },
] as const;

const KPIS = [
  { k: "Distance", v: "1,891", u: "mi", s: "of 3,068" },
  { k: "Speed", v: "12.4", u: "mph", s: "avg 12.3" },
  { k: "Elapsed", v: "7d 08h", u: "", s: "on pace" },
  { k: "ETA", v: "D11", u: "13:42 EDT", s: "+22m vs plan" },
];

export interface SpectatorProps {
  stations: DbTimeStation[];
  currentTs?: number;
  current?: { lat: number; lng: number } | null;
  teamName?: string;
  teamSlug?: string;
}

export function Spectator({
  stations,
  currentTs = 0,
  current = null,
  teamName,
  teamSlug,
}: SpectatorProps) {
  void teamName;
  void teamSlug;
  return (
    <div className="-mx-5 -mt-4">
      {/* Public nav */}
      <div className="flex items-center gap-4 border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[15px] font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, var(--strava-orange), #c2410c)",
            }}
          >
            K
          </div>
          <div>
            <div className="text-[15px] font-extrabold">
              Team Kabir · RAAM 2026
            </div>
            <div className="text-[11px] text-[color:var(--fg-3)]">
              Live tracker · Day 7 · 1,891 mi
            </div>
          </div>
        </div>
        <div className="flex-1" />
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-[11px] font-extrabold text-emerald-400">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          LIVE
        </span>
        <button className="rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white">
          Send a cheer
        </button>
        <button className="rounded-lg border border-[color:var(--border)] bg-transparent px-4 py-2 text-[13px] font-bold">
          Donate
        </button>
      </div>

      {/* Hero */}
      <div
        className="relative h-[420px] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--strava-orange) 0%, #9a3412 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.25), transparent 50%)",
          }}
        />
        <div className="absolute bottom-10 right-10 top-10 flex w-[560px] items-center justify-center rounded-2xl bg-black/25 text-[56px] text-white/40">
          ▸
        </div>
        <div className="absolute bottom-10 left-10 max-w-[520px] text-white">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.15em] opacity-85">
            DAY 7 OF 11 · COLUMBIA, MO
          </div>
          <div className="mt-2 text-[48px] font-extrabold leading-[1.05] tracking-[-0.02em]">
            Kabir is 1,891 miles into his journey.
          </div>
          <div className="mt-2.5 text-[15px] leading-[1.5] opacity-90">
            1,179 miles to go. Holding steady at 12.4 mph through the Missouri
            hills. Next rest stop at Camdenton in 4 hours.
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-7 px-10 py-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 overflow-hidden rounded-[14px] border border-[color:var(--border)] bg-[color:var(--bg-elev)]">
            <RouteMap
              stations={stations}
              currentTs={currentTs}
              current={current}
              height={320}
            />
            <div className="grid grid-cols-4 border-t border-[color:var(--border)]">
              {KPIS.map((s, i) => (
                <div
                  key={s.k}
                  className={cn(
                    "p-5",
                    i < 3 && "border-r border-[color:var(--border)]",
                  )}
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
                    {s.k}
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="font-mono text-[26px] font-extrabold tracking-[-0.02em]">
                      {s.v}
                    </span>
                    <span className="text-[12px] font-bold text-[color:var(--fg-3)]">
                      {s.u}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-[color:var(--fg-3)]">
                    {s.s}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3.5 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
            Milestones
          </div>
          <div className="overflow-hidden rounded-[14px] border border-[color:var(--border)] bg-[color:var(--bg-elev)]">
            {MILESTONES.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[60px_100px_1fr_80px] items-center gap-4 px-5 py-3.5",
                  i < MILESTONES.length - 1 &&
                    "border-b border-[color:var(--border-soft)]",
                  m.state === "live" && "bg-[rgba(252,76,2,0.08)]",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[11px] font-extrabold",
                    m.state === "live"
                      ? "text-[color:var(--strava-orange)]"
                      : "text-[color:var(--fg-3)]",
                  )}
                >
                  {m.day}
                </span>
                <span className="font-mono text-[11px] text-[color:var(--fg-3)]">
                  {m.ts}
                </span>
                <div>
                  <div
                    className={cn(
                      "text-[13px] font-bold",
                      m.state === "upcoming"
                        ? "text-[color:var(--fg-4)]"
                        : "text-[color:var(--fg)]",
                    )}
                  >
                    {m.loc}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
                    {m.evt}
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded px-2 py-0.5 text-center text-[10px] font-extrabold uppercase tracking-[0.08em]",
                    m.state === "done" &&
                      "bg-emerald-500/15 text-emerald-400",
                    m.state === "live" &&
                      "bg-[color:var(--strava-orange)] text-white",
                    m.state === "upcoming" &&
                      "bg-[color:var(--bg-row)] text-[color:var(--fg-4)]",
                  )}
                >
                  {m.state}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cheer feed */}
        <div>
          <div className="mb-3.5 flex items-baseline">
            <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
              Cheer wall
            </div>
            <span className="ml-auto font-mono text-[11px] font-extrabold text-[color:var(--strava-orange)]">
              2,847 cheers
            </span>
          </div>
          <div className="mb-3.5 rounded-[14px] border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4">
            <textarea
              placeholder="Leave a cheer for Kabir…"
              className="min-h-14 w-full resize-none border-none bg-transparent text-[13px] text-[color:var(--fg)] outline-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1">
                {["🧡", "💪", "🚴", "🔥", "🙏"].map((e) => (
                  <span key={e} className="cursor-pointer p-1 text-[18px]">
                    {e}
                  </span>
                ))}
              </div>
              <div className="flex-1" />
              <button className="rounded-md bg-[color:var(--strava-orange)] px-3.5 py-1.5 text-[12px] font-bold text-white">
                Send
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[14px] border border-[color:var(--border)] bg-[color:var(--bg-elev)]">
            {CHEERS.map((c, i) => (
              <div
                key={i}
                className={cn(
                  "px-4 py-3.5",
                  i < CHEERS.length - 1 &&
                    "border-b border-[color:var(--border-soft)]",
                )}
              >
                <div className="mb-1 flex items-baseline">
                  <span className="text-[12px] font-bold">{c.n}</span>
                  <span className="ml-auto font-mono text-[10px] text-[color:var(--fg-4)]">
                    {c.t} ago
                  </span>
                </div>
                <div className="text-[12px] leading-[1.5] text-[color:var(--fg)]">
                  {c.m}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
