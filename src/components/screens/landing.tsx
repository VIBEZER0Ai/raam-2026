import Link from "next/link";

/**
 * Public landing page for ventor.fit.
 * Shown when the visitor is not authenticated. Logged-in users bypass
 * this and land on their team dashboard.
 */
export function Landing() {
  return (
    <div className="flex flex-col gap-16 py-6 sm:py-12">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-3)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--strava-orange)]" />
          Endurance team operations
        </div>
        <h1 className="text-[42px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
          The race control room for{" "}
          <span className="text-[color:var(--strava-orange)]">
            ultra-endurance teams
          </span>
          .
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[color:var(--fg-3)] sm:text-[17px]">
          Live tracking, rule-based alerts, crew coordination, Whoop recovery,
          and time-station strategy — for RAAM, Transcontinental, Badwater,
          Ironman, and any ultra-distance event with a support crew.
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-[color:var(--strava-orange)] px-6 py-3 text-center text-[15px] font-extrabold text-white hover:opacity-90 sm:w-auto"
          >
            Create your team →
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-6 py-3 text-center text-[15px] font-extrabold hover:border-[color:var(--border-strong)] sm:w-auto"
          >
            Crew sign in
          </Link>
        </div>

        <p className="mt-4 text-[11px] text-[color:var(--fg-4)]">
          Free during beta · Invite your crew · Connect Whoop in 30 seconds
        </p>
      </section>

      {/* Showcase — Team Kabir as anchor customer */}
      <section className="mx-auto w-full max-w-5xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-6 sm:p-10">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--strava-orange)]">
              Powering Team Kabir · RAAM 2026
            </div>
            <h2 className="mt-1 text-[22px] font-extrabold sm:text-[28px]">
              Coach Kabir Rachure · 3rd RAAM attempt
            </h2>
            <p className="mt-1 text-[13px] text-[color:var(--fg-3)]">
              Oceanside → Annapolis · 3,087 mi · 53 time stations · 12-day
              cutoff
            </p>
          </div>
          <Link
            href="/spectator"
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-[12px] font-bold hover:border-[color:var(--strava-orange)]"
          >
            Watch live →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Feature
          title="Live tracking"
          body="GPS ingest from any tracker (SPOT, inReach, phone, official race feed). Map-matched to your course with mile markers and ETA to every time station."
        />
        <Feature
          title="Rule engine"
          body="Night follow mandatory · Direct-follow windows · Sleep plan triggers · Speed-below-2023-pace alerts · GPS silence penalty. Fires Discord in real time."
        />
        <Feature
          title="Whoop auto-pull"
          body="OAuth once — recovery, HRV, RHR, SpO2, sleep stages update every 30 minutes. Feeds the readiness widget and warns before degraded blocks."
        />
        <Feature
          title="Crew roster"
          body="Chief, operators, drivers, shuttle, RV, media. Contact fields, emergency contacts, role swaps. RLS scoped so each crew member sees only their team."
        />
        <Feature
          title="Nutrition + sleep"
          body="One-tap logging during race. Hourly carbs / water / sodium / caffeine progress against target. Rolling 3-hour totals. Sleep debt tracking post-event."
        />
        <Feature
          title="Spectator feed"
          body="Public live map for family, fans, sponsors. Embed-ready. No login required — works on phone, laptop, TV."
        />
      </section>

      {/* Sport support strip */}
      <section className="mx-auto w-full max-w-5xl rounded-2xl border border-[color:var(--border)] p-6 sm:p-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
          Built for
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "RAAM",
            "Transcontinental",
            "BikingMan series",
            "Badwater 135",
            "Spartathlon",
            "UTMB",
            "Ironman 140.6",
            "Ironman 70.3",
            "Ultraman",
            "24-hour races",
            "Custom ultras",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-3 py-1 text-[12px] font-semibold text-[color:var(--fg-2)]"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-8 text-center">
        <h3 className="text-[22px] font-extrabold sm:text-[26px]">
          Your next race deserves a control room.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[13px] text-[color:var(--fg-3)]">
          Set up in 5 minutes. Invite your crew. Pick an event template. Go.
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-block rounded-xl bg-[color:var(--strava-orange)] px-6 py-3 text-[15px] font-extrabold text-white"
        >
          Create your team
        </Link>
      </section>

      {/* Legal */}
      <footer className="mx-auto w-full max-w-5xl border-t border-[color:var(--border)] pb-6 pt-4 text-center text-[11px] text-[color:var(--fg-4)]">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span>© 2026 Ventor</span>
          <Link href="/privacy" className="hover:text-[color:var(--fg-2)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[color:var(--fg-2)]">
            Terms
          </Link>
          <a
            href="mailto:vishal@zer0.ai"
            className="hover:text-[color:var(--fg-2)]"
          >
            vishal@zer0.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5">
      <div className="text-[14px] font-extrabold tracking-[-0.01em]">
        {title}
      </div>
      <div className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--fg-3)]">
        {body}
      </div>
    </div>
  );
}
