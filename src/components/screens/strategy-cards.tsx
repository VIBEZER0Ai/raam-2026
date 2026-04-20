import {
  getSleepBlocks,
  getNightWindows,
  getCriticalSegments,
  getRaceProtocol,
} from "@/lib/db/queries";
import { Card, CardHead } from "@/components/ui/card";
import { Pill, type PillKind } from "@/components/ui/pill";

const PRIORITY_TO_PILL: Record<string, PillKind> = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

export async function StrategyCards() {
  const [sleep, night, critical, protocol] = await Promise.all([
    getSleepBlocks(),
    getNightWindows(),
    getCriticalSegments(),
    getRaceProtocol(),
  ]);

  const totalSleepMin = sleep.reduce((sum, b) => sum + b.max_duration_min, 0);
  const rule90 = protocol.find((p) => p.key === "90_minute_rule");
  const targetFinish = protocol.find((p) => p.key === "target_finish");

  return (
    <div className="flex flex-col gap-3.5">
      {rule90 && (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(127,29,29,0.6)] bg-red-500/10 px-4 py-3 text-red-200">
          <span className="rounded-sm bg-red-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
            90-MIN RULE
          </span>
          <div className="flex-1 text-[13px] font-semibold leading-snug">
            {rule90.value} — any night window crash triggers mandatory sleep
            intervention.
          </div>
          {targetFinish && (
            <span className="hidden font-mono text-[11px] text-[color:var(--fg-4)] md:inline">
              Target · {targetFinish.value}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-3.5 lg:grid-cols-2">
        <Card>
          <CardHead
            left={`Sleep plan · ${sleep.length} blocks`}
            right={
              <span className="font-mono text-emerald-400">
                {Math.floor(totalSleepMin / 60)}h {totalSleepMin % 60}m budget
              </span>
            }
          />
          <div className="flex flex-col">
            {sleep.map((b) => (
              <div
                key={b.event_num}
                className="flex items-center gap-3 border-b border-[color:var(--border-soft)] px-4 py-2.5 text-[13px] last:border-b-0"
              >
                <span className="flex h-7 w-10 items-center justify-center rounded bg-indigo-500/15 font-mono text-[11px] font-bold text-indigo-400">
                  #{b.event_num}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[color:var(--fg-1)]">
                    {b.location}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-[color:var(--fg-4)]">
                    {b.race_day}
                    {b.near_ts_num !== null ? ` · near TS${b.near_ts_num}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[16px] font-bold tabular-nums text-[color:var(--fg-1)]">
                    {b.max_duration_min}
                    <span className="text-[11px] font-normal text-[color:var(--fg-4)]">
                      {" "}
                      min
                    </span>
                  </div>
                  {b.skip_trigger && (
                    <div className="mt-0.5 max-w-[200px] text-right text-[10px] text-[color:var(--fg-5)]">
                      skip if: {b.skip_trigger}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead
            left={`Night crash windows · ${night.length}`}
            right={<span className="font-mono">01:00 – 05:00 local</span>}
          />
          <div className="flex flex-col">
            {night.map((w) => (
              <div
                key={w.night_num}
                className="flex flex-col gap-1.5 border-b border-[color:var(--border-soft)] px-4 py-2.5 text-[13px] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-10 items-center justify-center rounded bg-[color:var(--bg-row)] font-mono text-[11px] font-bold text-[color:var(--fg-2)]">
                    N{w.night_num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[color:var(--fg-1)]">
                      {w.location}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[color:var(--fg-4)]">
                      mi {Number(w.mile_start).toFixed(0)}–
                      {Number(w.mile_end).toFixed(0)}
                      {w.low_speed_2023 !== null && (
                        <>
                          {" · 2023 low "}
                          <span className="text-[color:var(--fg-2)]">
                            {Number(w.low_speed_2023).toFixed(1)} mph
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Pill kind={PRIORITY_TO_PILL[w.priority] ?? "INFO"} />
                </div>
                {w.assessment && (
                  <div className="pl-13 text-[11px] leading-relaxed text-[color:var(--fg-3)]">
                    {w.assessment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {critical.length > 0 && (
        <Card>
          <CardHead
            left={`Critical segments · ${critical.length}`}
            right={<span className="font-mono">2022 gap &gt; 30% vs best</span>}
          />
          <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {critical.map((c) => (
              <div
                key={c.id}
                className="rounded-[10px] border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 text-[12px] font-semibold text-[color:var(--fg-1)]">
                    {c.from_station} → {c.to_station}
                  </div>
                  <Pill kind={PRIORITY_TO_PILL[c.severity] ?? "INFO"} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] tabular-nums text-[color:var(--fg-3)]">
                  <div>
                    <div className="text-[color:var(--fg-5)]">2022</div>
                    <div className="text-red-400">
                      {c.speed_2023 !== null
                        ? Number(c.speed_2023).toFixed(1)
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[color:var(--fg-5)]">2023</div>
                    <div>
                      {c.speed_2023 !== null
                        ? Number(c.speed_2023).toFixed(1)
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[color:var(--fg-5)]">best</div>
                    <div className="text-emerald-400">
                      {c.best_speed !== null
                        ? Number(c.best_speed).toFixed(1)
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
