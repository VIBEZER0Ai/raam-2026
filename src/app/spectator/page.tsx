import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/**
 * Public spectator index — lists teams with active public tracking.
 * Each team has its own page at /spectator/[slug].
 *
 * For MVP / launch we list only active teams. Post-launch can expose
 * an explicit `public_tracking` flag per team.
 */
export const revalidate = 60;

export default async function SpectatorIndex() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team")
    .select("slug,name,sport,event_code,race_start_at")
    .eq("active", true)
    .order("race_start_at", { ascending: true });
  const teams = data ?? [];

  return (
    <main className="mx-auto max-w-3xl py-10 sm:py-16">
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-3)]">
          Ventor · Spectator
        </div>
        <h1 className="text-[32px] font-extrabold tracking-[-0.02em] sm:text-[40px]">
          Follow a team live
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-[color:var(--fg-3)]">
          Public race-day trackers for teams running their operations on Ventor.
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-6 text-center text-[13px] text-[color:var(--fg-3)]">
          No public teams yet.{" "}
          <Link
            href="/signup"
            className="text-[color:var(--strava-orange)] underline"
          >
            Create your team →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {teams.map((t) => (
            <Link
              key={t.slug}
              href={`/spectator/${t.slug}`}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4 transition-colors hover:border-[color:var(--strava-orange)]"
            >
              <div className="text-[15px] font-extrabold">{t.name}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[color:var(--fg-4)]">
                {t.sport}
                {t.event_code ? ` · ${t.event_code}` : ""}
                {t.race_start_at
                  ? ` · starts ${new Date(t.race_start_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}`
                  : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
