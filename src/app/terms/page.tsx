export const metadata = {
  title: "Terms of Use · Team Kabir RAAM 2026",
};

const EFFECTIVE = "April 22, 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-[14px] leading-relaxed text-[color:var(--fg-1)]">
      <h1 className="mb-2 text-[28px] font-extrabold">Terms of Use</h1>
      <p className="mb-8 text-[12px] uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
        Effective {EFFECTIVE}
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">1. Acceptance</h2>
        <p>
          By signing in to the Team Kabir RAAM 2026 operations app
          (&ldquo;the app&rdquo;) you agree to these Terms and to the
          accompanying{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          . The app is provided by Vishal Behal (Zer0.ai) for the
          private use of crew members supporting Kabir Rachure&rsquo;s
          Race Across America 2026 attempt.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">2. Eligible users</h2>
        <p>
          Access is limited to crew members named on the Team Kabir
          roster. Accounts are invite-only. You must be 18+ to use the
          app.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">3. Acceptable use</h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            Do not share your login link or session with anyone outside
            the crew.
          </li>
          <li>
            Do not attempt to access another crew member&rsquo;s Whoop
            data, messages, or logs without explicit permission from
            that person.
          </li>
          <li>
            Do not reverse-engineer, scrape, or automate the app in ways
            that degrade performance for the rest of the crew.
          </li>
          <li>
            Do not use the app to publish information about the race or
            crew before the team&rsquo;s communications lead has cleared
            it.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">
          4. Third-party integrations
        </h2>
        <p>
          Whoop, Supabase, Vercel, Discord, and the map tile providers
          have their own terms. When you connect a third-party account
          (e.g., Whoop OAuth), you agree to that provider&rsquo;s terms
          in addition to these.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">5. No medical advice</h2>
        <p>
          Recovery scores, sleep data, and rule-engine alerts are
          operational signals for the crew chief, not medical
          recommendations. Medical decisions remain with the rider and
          any contracted medical staff.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">
          6. Availability &amp; liability
        </h2>
        <p>
          The app is provided &ldquo;as is&rdquo; with no warranty of
          uptime or accuracy. Race-critical decisions must always be
          cross-checked against RAAM&rsquo;s official tracking and the
          crew chief&rsquo;s judgment. To the maximum extent permitted
          by applicable law, Vishal Behal and Zer0.ai disclaim all
          liability for indirect or consequential damages arising from
          use of the app.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">7. Termination</h2>
        <p>
          We may suspend or remove an account that violates these Terms
          or presents a safety risk to the team. On termination, your
          Whoop tokens are revoked within our system and associated
          data is deleted per the retention policy in the Privacy
          Policy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">8. Governing law</h2>
        <p>
          These Terms are governed by the laws of the Province of
          Ontario, Canada, without regard to conflict-of-law rules.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[18px] font-bold">9. Contact</h2>
        <p>
          Vishal Behal —{" "}
          <a
            href="mailto:vishal@zer0.ai"
            className="text-[color:var(--strava-orange)] underline"
          >
            vishal@zer0.ai
          </a>
        </p>
      </section>
    </main>
  );
}
