import { getTimeStations, getTargetPlan } from "@/lib/db/queries";
import { RACE } from "@/lib/raam/race-config";

export async function TsListLive() {
  const [stations, plan] = await Promise.all([
    getTimeStations(),
    getTargetPlan(),
  ]);

  if (stations.length === 0) {
    return (
      <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-sm text-amber-300">
        No time stations loaded from Supabase. Run migrations 0001 + 0002
        (schema + seed) and add public read policy.
      </div>
    );
  }

  const planByTs = new Map(plan.map((p) => [p.ts_num, p]));
  const checkpointNums: number[] = RACE.intermediate_checkpoints.map(
    (c) => c.ts,
  );
  const first = stations.filter((s) => s.ts_num > 0).slice(0, 12);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <div className="text-xs uppercase tracking-wider text-zinc-400">
          Time Stations — Live from Supabase
        </div>
        <div className="text-xs text-zinc-500">
          {stations.length - 1} total · {plan.length} targets loaded
        </div>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {first.map((ts) => {
          const isCheckpoint = checkpointNums.includes(ts.ts_num);
          const target = planByTs.get(ts.ts_num);
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
                    mi {Number(ts.mile_total).toFixed(1)} ·{" "}
                    {Number(ts.miles_to_fin).toFixed(0)} to fin
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-zinc-300">
                  2023: {ts.split_2023_elapsed}
                </div>
                {target && (
                  <div className="font-mono text-xs text-emerald-400">
                    target: D{target.target_arr_race_day}{" "}
                    {target.target_arr_time}
                    {target.target_speed_mph !== null
                      ? ` · ${Number(target.target_speed_mph).toFixed(1)} mph`
                      : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
