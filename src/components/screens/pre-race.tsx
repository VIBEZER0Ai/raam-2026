/**
 * V2 · Pre-race planning (Desktop).
 * Tabs: Route · Crew · Sleep · Nutrition · Manifest.
 * Source: /tmp/raam-v2/v2/V2_prerace.jsx (design handoff).
 */

import type {
  DbTimeStation,
  DbTargetPlan,
  DbSleepBlock,
} from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "route", l: "Route", sub: "GPX · segments · crew assigns" },
  { id: "crew", l: "Crew", sub: "Shifts · rotations · sleep" },
  { id: "sleep", l: "Sleep", sub: "Blocks · locations · skip rules" },
  { id: "nutrition", l: "Nutrition", sub: "Baselines · phase curves" },
  { id: "manifest", l: "Manifest", sub: "Vehicles · gear" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export interface PreRaceProps {
  tab?: TabId;
  stations: DbTimeStation[];
  targets: DbTargetPlan[];
  sleep: DbSleepBlock[];
}

export function PreRace({
  tab = "route",
  stations,
  targets,
  sleep,
}: PreRaceProps) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-5 border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] px-8 py-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--strava-orange)]">
            Pre-race planning
          </div>
          <div className="mt-0.5 text-[22px] font-extrabold tracking-[-0.01em]">
            RAAM 2026 · Team Kabir
          </div>
        </div>
        <div className="ml-8 flex gap-6">
          <Summary k="Start" v="Jun 16, 2026" />
          <Summary k="Days to start" v="56" hi />
          <Summary k="Plan status" v="Draft v3" />
          <Summary k="Last edit" v="Sapna · 12m ago" />
        </div>
        <div className="flex-1" />
        <button className="rounded-lg border border-[color:var(--border)] bg-transparent px-4 py-2 text-[13px] font-bold text-[color:var(--fg)]">
          Preview
        </button>
        <button className="rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white">
          Publish plan
        </button>
      </div>

      <div className="flex border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] px-8">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <a
              key={t.id}
              href={`/pre-race?tab=${t.id}`}
              className={cn(
                "-mb-px cursor-pointer border-b-2 px-5 py-3.5",
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
        {tab === "route" && <RouteTab stations={stations} targets={targets} />}
        {tab === "crew" && <CrewTab />}
        {tab === "sleep" && <SleepTab sleep={sleep} />}
        {tab === "nutrition" && <NutritionTab />}
        {tab === "manifest" && <ManifestTab />}
      </div>
    </div>
  );
}

function Summary({ k, v, hi }: { k: string; v: string; hi?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
        {k}
      </div>
      <div
        className={cn(
          "mt-0.5 font-mono text-[16px] font-extrabold tabular-nums",
          hi ? "text-[color:var(--strava-orange)]" : "text-[color:var(--fg)]",
        )}
      >
        {v}
      </div>
    </div>
  );
}

/* ── Route tab ──────────────────────────────────────────────────────── */

function RouteTab({
  stations,
  targets,
}: {
  stations: DbTimeStation[];
  targets: DbTargetPlan[];
}) {
  const segs = stations.slice(0, 9).map((ts, i) => {
    const next = stations[i + 1];
    return {
      n: i + 1,
      name: next ? `${ts.name} → ${next.name}` : ts.name,
      mi: next
        ? `${Number(ts.mile_total).toFixed(0)} – ${Number(next.mile_total).toFixed(0)}`
        : `${Number(ts.mile_total).toFixed(0)}`,
      target: targets.find((t) => t.ts_num === ts.ts_num)?.notes ?? "",
    };
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <Card>
        <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-3.5">
          <div className="text-[13px] font-extrabold">
            Route · 3,068 mi · {stations.length - 1} segments
          </div>
          <span className="rounded bg-[color:var(--bg-row)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[color:var(--fg-3)]">
            GPX · raam_2026.gpx
          </span>
          <div className="flex-1" />
          <button className="rounded-md border border-[color:var(--border)] bg-transparent px-3 py-1.5 text-[11px] text-[color:var(--fg-3)]">
            Import GPX
          </button>
          <button className="rounded-md border border-[color:var(--border)] bg-transparent px-3 py-1.5 text-[11px] text-[color:var(--fg-3)]">
            Split segment
          </button>
        </div>
        <div
          className="relative h-[440px]"
          style={{
            background:
              "linear-gradient(135deg,#0c2030 0%,#302410 40%,#301010 100%)",
          }}
        >
          <svg viewBox="0 0 900 440" className="h-full w-full">
            <path
              d="M 40 340 Q 120 320 180 330 T 320 280 Q 400 260 480 240 T 620 180 Q 720 140 820 100"
              stroke="var(--strava-orange)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 40 340 Q 120 320 180 330 T 320 280 Q 400 260 480 240 T 620 180 Q 720 140 820 100"
              stroke="var(--strava-orange)"
              strokeWidth="12"
              fill="none"
              strokeOpacity="0.18"
              strokeLinecap="round"
            />
            {[
              [40, 340],
              [180, 330],
              [320, 280],
              [400, 260],
              [480, 240],
              [560, 210],
              [620, 180],
              [720, 140],
              [820, 100],
            ].map((p, i) => (
              <g key={i}>
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r="7"
                  fill="var(--bg-elev)"
                  stroke="var(--strava-orange)"
                  strokeWidth="2"
                />
                <text
                  x={p[0]}
                  y={p[1] + 3}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill="var(--fg)"
                  fontFamily="ui-monospace"
                >
                  {i}
                </text>
              </g>
            ))}
            <text
              x="40"
              y="365"
              fontSize="10"
              fontWeight="800"
              fill="var(--fg)"
            >
              OCEANSIDE
            </text>
            <text
              x="820"
              y="90"
              fontSize="10"
              fontWeight="800"
              fill="var(--fg)"
              textAnchor="end"
            >
              ATLANTIC CITY
            </text>
          </svg>
        </div>
        <div className="border-t border-[color:var(--border)] p-4">
          <div className="mb-2 flex items-center">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
              Elevation profile
            </div>
            <div className="ml-auto font-mono text-[11px] text-[color:var(--fg-3)]">
              170,000 ft total climb
            </div>
          </div>
          <svg viewBox="0 0 900 80" className="h-20 w-full">
            <path
              d="M 0 70 Q 100 60 200 55 T 400 40 Q 500 20 600 35 T 800 15 L 900 20 L 900 80 L 0 80 Z"
              fill="var(--strava-orange)"
              fillOpacity="0.2"
            />
            <path
              d="M 0 70 Q 100 60 200 55 T 400 40 Q 500 20 600 35 T 800 15 L 900 20"
              stroke="var(--strava-orange)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      </Card>

      <Card className="flex max-h-[700px] flex-col overflow-hidden">
        <div className="flex items-baseline border-b border-[color:var(--border)] px-5 py-3.5">
          <div className="text-[13px] font-extrabold">Segments</div>
          <div className="ml-auto font-mono text-[11px] text-[color:var(--fg-3)]">
            {segs.length} of {stations.length - 1}
          </div>
        </div>
        <div className="overflow-auto">
          {segs.map((s, i) => (
            <div
              key={s.n}
              className={cn(
                "border-b border-[color:var(--border-soft)] px-5 py-3",
                i === 2 && "bg-amber-500/8",
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[11px] font-extrabold text-[color:var(--fg-4)]">
                  {String(s.n).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[12px] font-bold">{s.name}</span>
                <span className="font-mono text-[10px] text-[color:var(--fg-3)]">
                  {s.mi}
                </span>
              </div>
              {s.target && (
                <div className="mt-1.5 text-[10px] text-[color:var(--fg-3)]">
                  {s.target}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── Crew tab ───────────────────────────────────────────────────────── */

function CrewTab() {
  const days = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11"];
  const rows = [
    { who: "Sapna R.", role: "Chief", blocks: [[0, 11, "on"]] },
    { who: "Neha P.", role: "CC", blocks: [[0, 4, "on"], [4, 5, "off"], [5, 11, "on"]] },
    { who: "Rohan M.", role: "Driver", blocks: [[0, 2, "on"], [2, 3, "off"], [3, 6, "on"], [6, 7, "off"], [7, 11, "on"]] },
    { who: "Amit V.", role: "Driver", blocks: [[0, 1, "off"], [1, 3, "on"], [3, 5, "off"], [5, 8, "on"], [8, 9, "off"], [9, 11, "on"]] },
    { who: "Priya S.", role: "Medical", blocks: [[0, 11, "on"]] },
    { who: "Kabir (R)", role: "Rider", blocks: [[0, 11, "ride"]] },
    { who: "Dev K.", role: "Mechanic", blocks: [[0, 3, "on"], [3, 4, "off"], [4, 7, "on"], [7, 8, "off"], [8, 11, "on"]] },
    { who: "Anika T.", role: "Nutrition", blocks: [[0, 11, "on"]] },
  ] as const;
  const colorFor = (v: string) =>
    v === "on"
      ? "var(--emerald-400)"
      : v === "ride"
        ? "var(--strava-orange)"
        : v === "off"
          ? "var(--fg-4)"
          : "var(--indigo-400)";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Card>
        <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-3.5">
          <div className="text-[13px] font-extrabold">
            Crew shifts · 11-day race
          </div>
          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.05em] text-emerald-400">
            COVERAGE 98%
          </span>
          <div className="flex-1" />
          <div className="flex gap-3 text-[10px] text-[color:var(--fg-3)]">
            <LegendDot color="var(--emerald-400)" label="On duty" />
            <LegendDot color="var(--fg-4)" label="Off" dim />
            <LegendDot color="var(--strava-orange)" label="Riding" />
          </div>
        </div>
        <div className="grid grid-cols-[180px_1fr] border-b border-[color:var(--border-soft)] bg-[color:var(--bg-row)]/50 px-5 py-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
            Crew
          </div>
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {days.map((d) => (
              <div
                key={d}
                className="text-center font-mono text-[10px] font-extrabold text-[color:var(--fg-3)]"
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        {rows.map((r) => (
          <div
            key={r.who}
            className="grid grid-cols-[180px_1fr] items-center border-b border-[color:var(--border-soft)] px-5 py-3"
          >
            <div>
              <div className="text-[12px] font-bold">{r.who}</div>
              <div className="mt-0.5 text-[10px] text-[color:var(--fg-3)]">
                {r.role}
              </div>
            </div>
            <div
              className="grid h-7 gap-0.5"
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              {days.map((_, di) => {
                const block = r.blocks.find((b) => di >= b[0] && di < b[1]);
                const v = block ? (block[2] as string) : "off";
                return (
                  <div
                    key={di}
                    className="rounded-[3px]"
                    style={{
                      background: colorFor(v),
                      opacity: v === "off" ? 0.2 : 0.85,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      <div className="flex flex-col gap-3">
        <Card className="p-4">
          <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
            Coverage warnings
          </div>
          {[
            { title: "Only 1 driver D4 night", body: "22:00 D4–06:00 D5 only Amit on duty. Add backup.", color: "amber" },
            { title: "Medical gap D6 03:00–07:00", body: "Priya off. Consider shifting sleep block 5.", color: "amber" },
            { title: "Mechanic overlap D7", body: "Dev + Amit both on duty 10:00–14:00. Flagged.", color: "indigo" },
          ].map((w, i) => (
            <div
              key={i}
              className={cn(
                "py-2.5",
                i < 2 && "border-b border-[color:var(--border-soft)]",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    w.color === "amber" ? "bg-amber-400" : "bg-indigo-400",
                  )}
                />
                <div className="text-[12px] font-bold">{w.title}</div>
              </div>
              <div className="mt-1 text-[10px] leading-tight text-[color:var(--fg-3)]">
                {w.body}
              </div>
            </div>
          ))}
        </Card>
        <Card className="p-4">
          <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
            Rotation totals
          </div>
          {[
            { k: "Avg on-duty/day", v: "5.8" },
            { k: "Driver hrs total", v: "412" },
            { k: "Max consecutive on", v: "11h · Sapna" },
            { k: "Min rest between", v: "4h · Amit D3" },
          ].map((s) => (
            <div
              key={s.k}
              className="flex justify-between border-b border-[color:var(--border-soft)] py-2 text-[11px] last:border-b-0"
            >
              <span className="text-[color:var(--fg-3)]">{s.k}</span>
              <span className="font-mono font-bold">{s.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function LegendDot({
  color,
  label,
  dim,
}: {
  color: string;
  label: string;
  dim?: boolean;
}) {
  return (
    <span className="flex items-center gap-1">
      <i
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ background: color, opacity: dim ? 0.4 : 1 }}
      />
      {label}
    </span>
  );
}

/* ── Sleep tab ──────────────────────────────────────────────────────── */

function SleepTab({ sleep }: { sleep: DbSleepBlock[] }) {
  const total = sleep.reduce((s, b) => s + b.max_duration_min, 0);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Card>
        <div className="flex items-baseline gap-3 border-b border-[color:var(--border)] px-5 py-3.5">
          <div className="text-[13px] font-extrabold">Planned sleep blocks</div>
          <span className="font-mono text-[11px] text-[color:var(--fg-3)]">
            {sleep.length} blocks · {Math.floor(total / 60)}h {total % 60}m total
          </span>
          <div className="flex-1" />
          <button className="rounded-md bg-[color:var(--strava-orange)] px-3 py-1.5 text-[11px] font-bold text-white">
            + Add block
          </button>
        </div>
        {sleep.map((b) => (
          <div
            key={b.event_num}
            className="grid grid-cols-[40px_1fr_80px_200px] items-center gap-4 border-b border-[color:var(--border-soft)] px-5 py-4 last:border-b-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-500/15 text-[14px] font-extrabold text-indigo-400">
              {b.event_num}
            </div>
            <div>
              <div className="text-[13px] font-bold">{b.location}</div>
              <div className="mt-0.5 text-[10px] text-[color:var(--fg-3)]">
                {b.race_day}
                {b.near_ts_num !== null ? ` · near TS${b.near_ts_num}` : ""}
              </div>
            </div>
            <div className="font-mono text-[20px] font-extrabold">
              {b.max_duration_min}
              <span className="ml-0.5 text-[11px] text-[color:var(--fg-3)]">
                m
              </span>
            </div>
            <div>
              {b.skip_trigger ? (
                <div className="text-[10px]">
                  <div className="font-bold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
                    Skip if
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 font-semibold",
                      b.skip_trigger === "NEVER"
                        ? "text-red-400"
                        : "text-[color:var(--fg)]",
                    )}
                  >
                    {b.skip_trigger}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-[color:var(--fg-4)]">
                  No skip rule
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
          Strategy
        </div>
        <div className="mb-4 text-[12px] leading-relaxed text-[color:var(--fg-3)]">
          Sleep stacked early when heat tolerance matters, compressed late when
          delta permits. Block 4 (Ulysses) is the anchor —{" "}
          <b className="text-[color:var(--fg)]">never skip</b>.
        </div>
        <div className="mb-3 rounded-lg bg-[color:var(--bg-row)] p-3">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
            Total planned sleep
          </div>
          <div className="mt-1 font-mono text-[26px] font-extrabold text-indigo-400">
            {Math.floor(total / 60)}h {total % 60}m
          </div>
          <div className="mt-0.5 text-[10px] text-[color:var(--fg-3)]">
            across 11-day race · {Math.round(total / 11)} min/day avg
          </div>
        </div>
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
          Contingency
        </div>
        {[
          "+15m reserve block TS32 if behind >45m",
          "Emergency nap (10m) anywhere delta > +1h",
          "Hard stop >2.5h if medical triggers",
        ].map((s, i) => (
          <div
            key={i}
            className="flex gap-2 py-1.5 text-[11px] text-[color:var(--fg)]"
          >
            <span className="font-extrabold text-[color:var(--strava-orange)]">
              ·
            </span>
            {s}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── Nutrition tab ──────────────────────────────────────────────────── */

function NutritionTab() {
  const phases = [
    "D1 Desert",
    "D2 Climb",
    "D3 Plains",
    "D4 Plains",
    "D5 Midwest",
    "D6 Midwest",
    "D7 Appalachia",
    "D8 Finish",
  ];
  const metrics = [
    { k: "Carb g/h", base: 90, vals: [95, 90, 92, 88, 85, 82, 78, 75] },
    { k: "Water ml/h", base: 750, vals: [950, 900, 850, 800, 780, 780, 720, 700] },
    { k: "Na mg/h", base: 950, vals: [1200, 1100, 1000, 950, 900, 900, 850, 800] },
    { k: "Caf mg/h", base: 80, vals: [40, 60, 80, 100, 100, 120, 120, 140] },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <Card className="p-5">
        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
          Rider baseline
        </div>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--strava-orange)] text-[14px] font-extrabold text-white">
            KR
          </div>
          <div>
            <div className="text-[14px] font-bold">Kabir R.</div>
            <div className="text-[10px] text-[color:var(--fg-3)]">
              Solo Men · #610
            </div>
          </div>
        </div>
        {[
          { k: "Carb tolerance", v: "90 g/h", hint: "tested in training" },
          { k: "Sweat rate", v: "1.4 L/h", hint: "in 32°C" },
          { k: "Sodium loss", v: "1,100 mg/L", hint: "moderate" },
          { k: "Caffeine habit", v: "200 mg/day", hint: "pre-race typical" },
          { k: "Known dislikes", v: "Plain water", hint: "add electrolyte mix" },
        ].map((f) => (
          <div
            key={f.k}
            className="border-b border-[color:var(--border-soft)] py-2.5 last:border-b-0"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
              {f.k}
            </div>
            <div className="mt-0.5 font-mono text-[14px] font-bold">{f.v}</div>
            <div className="mt-0.5 text-[10px] text-[color:var(--fg-3)]">
              {f.hint}
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div className="flex items-baseline gap-3 border-b border-[color:var(--border)] px-5 py-3.5">
          <div className="text-[13px] font-extrabold">
            Phase curves · targets per hour
          </div>
          <span className="text-[10px] text-[color:var(--fg-3)]">
            target = baseline × phase curve
          </span>
        </div>
        {metrics.map((m) => {
          const max = Math.max(...m.vals);
          return (
            <div
              key={m.k}
              className="border-b border-[color:var(--border-soft)] px-5 py-3.5 last:border-b-0"
            >
              <div className="mb-2 flex items-baseline">
                <div className="w-[110px] text-[12px] font-bold">{m.k}</div>
                <div className="mr-3.5 font-mono text-[11px] text-[color:var(--fg-3)]">
                  base {m.base}
                </div>
                <div
                  className="grid h-12 flex-1 items-end gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${phases.length}, 1fr)`,
                  }}
                >
                  {m.vals.map((v, i) => (
                    <div key={i} className="relative h-full">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-[3px] bg-[color:var(--strava-orange)] opacity-75"
                        style={{ height: `${(v / max) * 100}%` }}
                      />
                      <div className="absolute bottom-[calc(100%+2px)] left-0 right-0 text-center font-mono text-[9px] font-bold text-[color:var(--fg-3)]">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[124px_1fr] gap-3.5">
                <div />
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${phases.length}, 1fr)`,
                  }}
                >
                  {phases.map((p) => (
                    <div
                      key={p}
                      className="text-center text-[9px] font-semibold text-[color:var(--fg-4)]"
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ── Manifest tab ───────────────────────────────────────────────────── */

function ManifestTab() {
  const vehicles = [
    {
      id: "VAN-1",
      name: "Follow van 1",
      plate: "6ABC123",
      inv: 38,
      packed: 32,
      crit: ["Spare wheelset ×2", "First aid kit", "GPS tracker", "Extra lights"],
    },
    {
      id: "VAN-2",
      name: "Follow van 2",
      plate: "7XYZ998",
      inv: 36,
      packed: 34,
      crit: ["Cooler ×2", "Mechanic kit", "Extra hydration bottles"],
    },
    {
      id: "RV-1",
      name: "Rolling home",
      plate: "RV-554",
      inv: 72,
      packed: 58,
      crit: ["Sleep bunks ready", "Kitchen stocked", "Power inverter tested"],
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {vehicles.map((v) => {
        const pct = Math.round((v.packed / v.inv) * 100);
        const ringColor =
          pct >= 90
            ? "var(--emerald-400)"
            : pct >= 70
              ? "var(--amber-400)"
              : "var(--red-400)";
        return (
          <Card key={v.id} className="p-5">
            <div className="mb-3.5 flex items-baseline gap-2">
              <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--strava-orange)]">
                {v.id}
              </span>
              <span className="text-[14px] font-extrabold">{v.name}</span>
              <span className="ml-auto font-mono text-[10px] text-[color:var(--fg-3)]">
                {v.plate}
              </span>
            </div>
            <div className="mb-3.5 flex items-center gap-4 border-y border-[color:var(--border-soft)] py-3.5">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="var(--bg-row)"
                  strokeWidth="7"
                  fill="none"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke={ringColor}
                  strokeWidth="7"
                  fill="none"
                  strokeDasharray={`${(pct / 100) * 188.5} 188.5`}
                  strokeLinecap="round"
                  transform="rotate(-90 36 36)"
                />
                <text
                  x="36"
                  y="41"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="800"
                  fill="var(--fg)"
                  fontFamily="ui-monospace"
                >
                  {pct}%
                </text>
              </svg>
              <div>
                <div className="font-mono text-[20px] font-extrabold">
                  {v.packed}
                  <span className="text-[13px] text-[color:var(--fg-3)]">
                    {" "}
                    / {v.inv}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
                  Items packed
                </div>
              </div>
            </div>
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
              Critical gear
            </div>
            {v.crit.map((c, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 py-1.5 text-[11px]",
                  i < v.crit.length - 1 &&
                    "border-b border-[color:var(--border-soft)]",
                )}
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border-2 border-emerald-400 bg-emerald-400 text-[9px] font-extrabold text-white">
                  ✓
                </span>
                {c}
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );
}
