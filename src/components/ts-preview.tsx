import { TIME_STATIONS } from "@/lib/raam/time-stations";
import { RACE } from "@/lib/raam/race-config";

export function TsPreview() {
  // Show first 8 TS for quick glance, plus the 3 intermediate checkpoints always visible
  const first = TIME_STATIONS.slice(1, 9);
  const checkpointNums: number[] = RACE.intermediate_checkpoints.map(
    (c) => c.ts,
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="border-b border-zinc-800 px-5 py-3 text-xs uppercase tracking-wider text-zinc-400">
        Time Stations — 2023 Baseline (Kabir)
      </div>
      <div className="divide-y divide-zinc-800/60">
        {first.map((ts) => {
          const isCheckpoint = checkpointNums.includes(ts.ts_num);
          return (
            <div
              key={ts.ts_num}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-10 items-center justify-center rounded font-mono text-xs font-bold ${
                    isCheckpoint
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  TS{ts.ts_num}
                </span>
                <div>
                  <div className="font-medium text-zinc-100">
                    {ts.name}, {ts.state}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {ts.mile_total.toFixed(1)} mi ·{" "}
                    {ts.miles_to_fin.toFixed(0)} to finish
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-zinc-200">
                  {ts.split_2023_elapsed}
                </div>
                <div className="text-xs text-zinc-500">
                  {ts.avg_speed_2023.toFixed(2)} mph avg
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-zinc-800 px-5 py-2 text-xs text-zinc-500">
        {TIME_STATIONS.length - 1} total TS · Full list in dashboard
      </div>
    </div>
  );
}
