import { getNightWindows } from "@/lib/db/queries";

const priorityStyles = {
  LOW: "bg-emerald-500/15 text-emerald-400 border-emerald-900/40",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-900/40",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-900/40",
  CRITICAL: "bg-red-500/15 text-red-400 border-red-900/40",
} as const;

export async function NightWindows() {
  const windows = await getNightWindows();
  if (windows.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="border-b border-zinc-800 px-5 py-3">
        <div className="text-xs uppercase tracking-wider text-zinc-400">
          Night Crash Windows — 10 Zones to Protect
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          01:00-05:00 local. 90-Minute Rule: &lt;9 mph × 15 min = forced sleep.
        </div>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {windows.map((w) => (
          <div key={w.night_num} className="px-5 py-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-10 items-center justify-center rounded bg-zinc-800 font-mono text-xs font-bold text-zinc-300">
                  N{w.night_num}
                </span>
                <div>
                  <div className="font-medium text-zinc-100">{w.location}</div>
                  <div className="text-xs text-zinc-500">
                    mi {Number(w.mile_start).toFixed(0)}–
                    {Number(w.mile_end).toFixed(0)}
                    {w.low_speed_2023 !== null && (
                      <>
                        {" · 2023 low: "}
                        <span className="text-zinc-300">
                          {Number(w.low_speed_2023).toFixed(1)} mph
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[w.priority]}`}
              >
                {w.priority}
              </span>
            </div>
            {w.assessment && (
              <div className="mt-2 pl-13 text-xs leading-relaxed text-zinc-400">
                {w.assessment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
