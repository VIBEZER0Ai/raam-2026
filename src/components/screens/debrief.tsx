/**
 * V2 · Post-race debrief — Sponsor report builder (Desktop).
 * Source: /tmp/raam-v2/v2/V2_debrief.jsx.
 */

import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "cover", l: "Cover", inc: true, mod: "—" },
  { id: "exec", l: "Executive summary", inc: true, mod: "Sapna · 2d" },
  { id: "results", l: "Results & splits", inc: true, mod: "auto" },
  { id: "timeline", l: "Race timeline", inc: true, mod: "auto" },
  { id: "incidents", l: "Incident log", inc: true, mod: "Neha · 1d" },
  { id: "nutrition", l: "Nutrition & health", inc: true, mod: "Priya · 1d" },
  { id: "photos", l: "Photo highlights", inc: true, mod: "Dev · 3h" },
  { id: "sponsors", l: "Sponsor moments", inc: true, mod: "Sapna · 5h" },
  { id: "thanks", l: "Thank-you", inc: false, mod: "—" },
  { id: "appendix", l: "Appendix (CSV)", inc: false, mod: "auto" },
];

export function Debrief() {
  const incCount = SECTIONS.filter((s) => s.inc).length;
  return (
    <div className="-mx-5 -mt-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-5 border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] px-8 py-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--strava-orange)]">
            Post-race · Sponsor report
          </div>
          <div className="mt-0.5 text-[22px] font-extrabold tracking-[-0.01em]">
            RAAM 2026 · Team Kabir · FINAL
          </div>
        </div>
        <div className="ml-8 flex gap-6">
          {[
            { k: "Finish", v: "10d 09h 38m", hi: true },
            { k: "Overall", v: "4th of 12" },
            { k: "Raised", v: "$187.4K" },
            { k: "Reach", v: "2.1M imp" },
          ].map((s) => (
            <div key={s.k}>
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
                {s.k}
              </div>
              <div
                className={cn(
                  "mt-0.5 font-mono text-[16px] font-extrabold tabular-nums",
                  s.hi
                    ? "text-[color:var(--strava-orange)]"
                    : "text-[color:var(--fg)]",
                )}
              >
                {s.v}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <button className="rounded-lg border border-[color:var(--border)] bg-transparent px-4 py-2 text-[13px] font-bold">
          Share link
        </button>
        <button className="rounded-lg bg-[color:var(--fg)] px-4 py-2 text-[13px] font-bold text-[color:var(--bg)]">
          Export PDF
        </button>
      </div>

      {/* Body — editor + preview */}
      <div className="grid flex-1 grid-cols-[360px_1fr]">
        {/* Editor */}
        <div className="flex flex-col border-r border-[color:var(--border)] bg-[color:var(--bg-elev)]">
          <div className="border-b border-[color:var(--border)] px-5 py-3.5">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
              Sections
            </div>
            <div className="mt-1 text-[11px] text-[color:var(--fg-4)]">
              {incCount} of {SECTIONS.length} included · 24 pages
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 border-b border-[color:var(--border-soft)] px-5 py-3",
                  i === 2 && "bg-[color:var(--bg-row)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border-2 text-[11px] font-extrabold text-white",
                    s.inc
                      ? "border-[color:var(--strava-orange)] bg-[color:var(--strava-orange)]"
                      : "border-[color:var(--border)] bg-transparent",
                  )}
                >
                  {s.inc && "✓"}
                </div>
                <div className="flex-1">
                  <div
                    className={cn(
                      "text-[13px] font-bold",
                      s.inc
                        ? "text-[color:var(--fg)]"
                        : "text-[color:var(--fg-4)]",
                    )}
                  >
                    {s.l}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[color:var(--fg-3)]">
                    Last edit · {s.mod}
                  </div>
                </div>
                <span className="text-[16px] text-[color:var(--fg-4)]">≡</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[color:var(--border)] bg-[color:var(--bg-row)] p-4">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--fg-4)]">
              Template
            </div>
            <div className="flex gap-1.5">
              {["Sponsor", "Team retro", "Social"].map((t, i) => (
                <div
                  key={t}
                  className={cn(
                    "flex-1 rounded-md border px-2.5 py-2 text-center text-[11px] font-bold",
                    i === 0
                      ? "border-[color:var(--strava-orange)] bg-[color:var(--bg-elev)] text-[color:var(--strava-orange)]"
                      : "border-[color:var(--border)] bg-transparent text-[color:var(--fg-3)]",
                  )}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDF preview */}
        <div
          className="overflow-auto px-10 py-7"
          style={{ background: "#0a0a0c" }}
        >
          <div className="mx-auto max-w-[800px]">
            <Page page={1} total={24}>
              <div
                className="relative mb-7 h-[280px] overflow-hidden rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--strava-orange) 0%, #c2410c 100%)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.3), transparent 60%)",
                  }}
                />
                <div className="absolute bottom-6 left-7 text-white">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] opacity-85">
                    RACE ACROSS AMERICA 2026
                  </div>
                  <div className="mt-1 text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em]">
                    Team Kabir
                  </div>
                  <div className="mt-1 text-[13px] opacity-90">
                    3,068 miles · 11 days · one human body
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#111]">
                Sponsor report · Jun 2026
              </div>
              <div className="mt-1 text-[11px] text-[#666]">
                Prepared for: Summit Endurance Partners, Ridgeline Hydration,
                Atlas Nutrition
              </div>
            </Page>

            <Page page={3} total={24}>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--strava-orange)]">
                03 · Results
              </div>
              <div className="mt-1.5 text-[24px] font-extrabold tracking-[-0.01em] text-[#111]">
                We finished. 4th overall.
              </div>
              <div className="mb-6 mt-5 grid grid-cols-4 gap-4">
                {[
                  { k: "Finish time", v: "10d 09h 38m", s: "+0h 12m vs plan" },
                  { k: "Avg speed", v: "12.3 mph", s: "best-ever for rider" },
                  { k: "Total climb", v: "170,000 ft", s: "~6× Everest" },
                  { k: "Sleep total", v: "3h 14m", s: "−6m vs plan" },
                ].map((k) => (
                  <div
                    key={k.k}
                    className="rounded-md bg-[#f5f5f4] p-3"
                  >
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#666]">
                      {k.k}
                    </div>
                    <div className="mt-1 font-mono text-[18px] font-extrabold tracking-[-0.02em] text-[color:var(--strava-orange)]">
                      {k.v}
                    </div>
                    <div className="mt-0.5 text-[9px] text-[#888]">{k.s}</div>
                  </div>
                ))}
              </div>
              <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#666]">
                Splits vs plan
              </div>
              <svg viewBox="0 0 760 140" className="h-[140px] w-full">
                <line
                  x1="0"
                  y1="70"
                  x2="760"
                  y2="70"
                  stroke="#e7e5e4"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 0 70 L 80 62 L 160 58 L 240 65 L 320 78 L 400 85 L 480 90 L 560 82 L 640 74 L 720 70 L 760 68"
                  stroke="var(--strava-orange)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M 0 70 L 80 62 L 160 58 L 240 65 L 320 78 L 400 85 L 480 90 L 560 82 L 640 74 L 720 70 L 760 68 L 760 140 L 0 140 Z"
                  fill="var(--strava-orange)"
                  fillOpacity="0.1"
                />
                <text x="0" y="132" fontSize="9" fill="#888">
                  D1
                </text>
                <text x="150" y="132" fontSize="9" fill="#888">
                  D3
                </text>
                <text x="300" y="132" fontSize="9" fill="#888">
                  D5 · behind
                </text>
                <text x="450" y="132" fontSize="9" fill="#888">
                  D7 · recovered
                </text>
                <text x="700" y="132" fontSize="9" fill="#888">
                  FIN
                </text>
              </svg>
              <div className="mt-5 text-[11px] leading-[1.6] text-[#333]">
                The team crossed a 15-minute deficit on D4–D5 during the Great
                Plains heat wave (peak 41°C) and recovered it through
                disciplined pacing in the Appalachians. The final time beats
                our 10d 12h pre-race target by 22 minutes.
              </div>
            </Page>

            <Page page={11} total={24}>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--strava-orange)]">
                11 · Sponsor moments
              </div>
              <div className="mb-5 mt-1.5 text-[24px] font-extrabold tracking-[-0.01em] text-[#111]">
                Your brand, on the road.
              </div>
              <div className="mb-5 grid grid-cols-3 gap-3.5">
                {[
                  { label: "D2 · Borrego finish", imp: "180K" },
                  { label: "D4 · Ulysses feed", imp: "320K" },
                  { label: "D8 · Gettysburg", imp: "540K" },
                ].map((m) => (
                  <div key={m.label}>
                    <div
                      className="relative overflow-hidden rounded-md"
                      style={{
                        aspectRatio: "4/3",
                        background:
                          "linear-gradient(135deg, #d6d3d1, #a8a29e)",
                      }}
                    >
                      <div className="absolute right-2 top-2 rounded-sm bg-black/55 px-2 py-0.5 text-[9px] font-extrabold text-white">
                        {m.imp}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-[40px] text-white/60">
                        ▸
                      </div>
                    </div>
                    <div className="mt-1.5 text-[10px] font-semibold text-[#666]">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="rounded-sm border-l-[3px] bg-[#fff7ed] p-4"
                style={{ borderColor: "var(--strava-orange)" }}
              >
                <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--strava-orange)]">
                  Summit Endurance Partners · total reach
                </div>
                <div className="mt-1.5 font-mono text-[22px] font-extrabold text-[#111]">
                  2,148,200{" "}
                  <span className="text-[13px] text-[#888]">impressions</span>
                </div>
                <div className="mt-1 text-[11px] text-[#555]">
                  Instagram 1.1M · X 640K · TV + news 410K
                </div>
              </div>
            </Page>

            <div className="py-4 text-center text-[11px] text-[color:var(--fg-3)]">
              + 21 more pages · timeline, incidents, nutrition, photos, thanks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Page({
  page,
  total,
  children,
}: {
  page: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative mb-6 rounded-md bg-white p-10 text-[#111] shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
      style={{ aspectRatio: "8.5/11" }}
    >
      {children}
      <div className="absolute bottom-4 left-10 right-10 flex justify-between text-[9px] tracking-[0.1em] text-[#999]">
        <span>RAAM 2026 · TEAM KABIR</span>
        <span className="font-mono">
          {String(page).padStart(2, "0")} / {total}
        </span>
      </div>
    </div>
  );
}
