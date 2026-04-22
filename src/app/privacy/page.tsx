export const metadata = {
  title: "Privacy Policy · Team Kabir RAAM 2026",
};

const EFFECTIVE = "April 22, 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-[14px] leading-relaxed text-[color:var(--fg-1)]">
      <h1 className="mb-2 text-[28px] font-extrabold">Privacy Policy</h1>
      <p className="mb-8 text-[12px] uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
        Effective {EFFECTIVE}
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">1. Who we are</h2>
        <p>
          Team Kabir RAAM 2026 (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a
          private operations app built for the crew supporting cyclist
          Kabir Rachure in the Race Across America 2026. The app is
          operated by Vishal Behal (Zer0.ai, Toronto, Canada). This
          policy covers the web app hosted at{" "}
          <span className="font-mono">raam-2026.vercel.app</span>.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">2. Scope of users</h2>
        <p>
          Access is limited to named crew members of Team Kabir. There is
          no public sign-up. All accounts are invite-only via email magic
          link. Crew members are identified by name, role, email, phone,
          and optional emergency contact.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">
          3. Data collected from Whoop
        </h2>
        <p className="mb-2">
          When a crew member authorizes Whoop via OAuth, we store:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            OAuth access and refresh tokens, token expiry timestamp, and
            Whoop user ID.
          </li>
          <li>
            Daily recovery score, resting heart rate, heart rate
            variability (HRV RMSSD), SpO2, and skin temperature.
          </li>
          <li>
            Sleep events: start/end, total/REM/SWS minutes, efficiency,
            respiratory rate, disturbance count.
          </li>
        </ul>
        <p className="mt-2">
          Whoop data is used solely to inform race-day decisions (fatigue
          warnings, sleep-plan triggers). It is never sold, advertised
          against, or shared outside the crew roster.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">
          4. Other data collected
        </h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            GPS pings from the rider&rsquo;s tracker (lat/lng, speed,
            mile marker, timestamp).
          </li>
          <li>
            Crew-logged events: nutrition entries, rest/sleep logs,
            penalty notes, Discord messages forwarded via webhook.
          </li>
          <li>
            Rule-engine evaluations (timestamp, rule code, severity,
            whether a Discord alert was sent).
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">5. Storage &amp; security</h2>
        <p className="mb-2">
          Data is stored in a private Supabase (PostgreSQL) project in
          the US region with row-level security policies limiting access
          to authenticated crew members. All connections use TLS 1.2+.
          Tokens and secrets are stored encrypted at rest by Supabase.
        </p>
        <p>
          Hosting: Vercel (application), Supabase (database + auth),
          GitHub Actions (scheduled jobs). We do not use analytics or
          advertising trackers.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">6. Retention</h2>
        <p>
          Race-operational data is retained through the 2026 RAAM season
          plus 12 months for post-race debrief. Crew members may request
          deletion of their account and associated Whoop data at any
          time (see Section 9). On request, OAuth tokens are revoked and
          all associated rows are hard-deleted within 7 days.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">
          7. Third-party services
        </h2>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Whoop</strong> — wearable recovery &amp; sleep data,
            via OAuth 2.0.
          </li>
          <li>
            <strong>Supabase</strong> — auth and database.
          </li>
          <li>
            <strong>Vercel</strong> — web hosting, edge functions.
          </li>
          <li>
            <strong>Discord</strong> — alert channel for crew (outbound
            webhooks only).
          </li>
          <li>
            <strong>Mapbox / Google Maps</strong> — map tiles for the GPS
            view.
          </li>
        </ul>
        <p className="mt-2">
          We share only the minimum data needed for each service to
          function (e.g., the GPS ping is sent to the mapping provider
          to render tiles; no crew identity is disclosed).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">8. Cookies</h2>
        <p>
          We set only strictly-necessary session cookies from Supabase
          Auth (magic-link authentication) and a short-lived OAuth
          state/nonce cookie during the Whoop connection flow. We do not
          use advertising or analytics cookies.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">9. Your rights</h2>
        <p className="mb-2">You may at any time:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Request a copy of all data we hold about you.</li>
          <li>Disconnect Whoop (revokes tokens within our system).</li>
          <li>Request deletion of your account and Whoop history.</li>
          <li>
            Revoke the app&rsquo;s Whoop access directly via{" "}
            <a
              href="https://www.whoop.com/account/permissions"
              className="text-[color:var(--strava-orange)] underline"
              target="_blank"
              rel="noreferrer"
            >
              whoop.com/account/permissions
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-[18px] font-bold">10. Contact</h2>
        <p>
          Data controller: Vishal Behal
          <br />
          Email:{" "}
          <a
            href="mailto:vishal@zer0.ai"
            className="text-[color:var(--strava-orange)] underline"
          >
            vishal@zer0.ai
          </a>
          <br />
          Alternate:{" "}
          <a
            href="mailto:hello@vega.agency"
            className="text-[color:var(--strava-orange)] underline"
          >
            hello@vega.agency
          </a>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[18px] font-bold">11. Changes</h2>
        <p>
          We may update this policy as race operations evolve. Material
          changes will be communicated to the crew by email with at
          least 7 days&rsquo; notice before taking effect.
        </p>
      </section>
    </main>
  );
}
