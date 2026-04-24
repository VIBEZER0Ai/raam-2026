import Link from "next/link";

/**
 * Lightweight marketing header — used on public pages (/, /privacy,
 * /terms, /login, /signup). Replaces the full race-ops TopNav which
 * would look out of place with no authenticated team context.
 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[60px] max-w-[1440px] items-center gap-4 px-3 py-2.5 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <span className="block h-[22px] w-1 bg-[color:var(--strava-orange)]" />
          <span className="text-[14px] tracking-[0.04em]">VENTOR</span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.15em] text-[color:var(--fg-4)] sm:inline">
            endurance ops
          </span>
        </Link>

        <div className="flex-1" />

        <Link
          href="/spectator"
          className="hidden text-[12px] font-semibold text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)] sm:block"
        >
          Spectator
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-3.5 py-1.5 text-[12px] font-bold hover:border-[color:var(--border-strong)]"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-[color:var(--strava-orange)] px-3.5 py-1.5 text-[12px] font-extrabold text-white"
        >
          Create team
        </Link>
      </div>
    </header>
  );
}
