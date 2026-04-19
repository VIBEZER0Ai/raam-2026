import { Countdown } from "@/components/countdown";
import { TsPreview } from "@/components/ts-preview";
import { RACE } from "@/lib/raam/race-config";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-amber-400">
            Race Across America 2026 · 44th Edition
          </div>
          <h1 className="mt-2 text-3xl font-bold text-zinc-50">
            Team Kabir — Command & Control
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Coach {RACE.racer.name} · {RACE.racer.division} · Racer #
            {RACE.racer.number}
          </p>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <div>Oceanside, CA → Atlantic City, NJ</div>
          <div>
            {RACE.course.distance_miles.toLocaleString()} mi ·{" "}
            {RACE.course.time_stations} TS ·{" "}
            {RACE.course.elevation_gain_ft.toLocaleString()} ft climb
          </div>
        </div>
      </header>

      <Countdown />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Division Cutoff"
          value={`${RACE.division_cutoffs.solo_men_under_50_hours}h`}
          hint="Solo Men Under 50"
        />
        <Stat
          label="2023 Finish Time"
          value={RACE.baseline_2023.total_time_ddhhmm}
          hint={`${RACE.baseline_2023.avg_speed_mph} mph avg`}
        />
        <Stat
          label="TS Checkpoints"
          value="15 · 35 · 54"
          hint="Soft · Soft · HARD"
        />
        <Stat
          label="States Crossed"
          value={`${RACE.course.states_crossed}`}
          hint={`${RACE.course.time_zones} time zones`}
        />
      </section>

      <TsPreview />

      <footer className="pt-6 text-center text-xs text-zinc-600">
        Built for Team Kabir · Crew Chief: Sapna · C&C: Vishal Behal
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-400">
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-zinc-50">
        {value}
      </div>
      <div className="mt-1 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}
