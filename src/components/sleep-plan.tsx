import { getSleepBlocks } from "@/lib/db/queries";

export async function SleepPlan() {
  const blocks = await getSleepBlocks();
  if (blocks.length === 0) return null;

  const totalBudgetMin = blocks.reduce((sum, b) => sum + b.max_duration_min, 0);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="border-b border-zinc-800 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-zinc-400">
            Sleep Plan — Polyphasic, {blocks.length} Blocks
          </div>
          <div className="font-mono text-xs text-emerald-400">
            Budget: {Math.floor(totalBudgetMin / 60)}h {totalBudgetMin % 60}m
          </div>
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Pre-empt fatigue. Never skip Sleep #4 (Ulysses KS).
        </div>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {blocks.map((b) => (
          <div
            key={b.event_num}
            className="flex items-center justify-between px-5 py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-10 items-center justify-center rounded bg-indigo-500/15 font-mono text-xs font-bold text-indigo-400">
                #{b.event_num}
              </span>
              <div>
                <div className="font-medium text-zinc-100">{b.location}</div>
                <div className="text-xs text-zinc-500">
                  {b.race_day}
                  {b.near_ts_num !== null ? ` · near TS${b.near_ts_num}` : ""}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-bold text-zinc-100">
                {b.max_duration_min}
                <span className="text-xs font-normal text-zinc-500"> min</span>
              </div>
              {b.skip_trigger && (
                <div className="mt-0.5 max-w-xs text-right text-[10px] text-zinc-500">
                  skip if: {b.skip_trigger}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
