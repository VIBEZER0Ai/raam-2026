import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in · Ventor",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-24">
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-8">
        <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[color:var(--strava-orange)]">
          Ventor · endurance ops
        </div>
        <h1 className="text-[26px] font-extrabold tracking-[-0.01em]">
          Sign in
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--fg-3)]">
          Magic link sent to your inbox. New here?{" "}
          <a href="/signup" className="text-[color:var(--strava-orange)]">
            Create a team
          </a>
          .
        </p>
        <LoginForm next={sp.next ?? "/"} />
        <div className="mt-6 border-t border-[color:var(--border-soft)] pt-4 text-[11px] text-[color:var(--fg-4)]">
          Following a public team? Spectator view:{" "}
          <a className="text-[color:var(--strava-orange)]" href="/spectator">
            /spectator
          </a>
        </div>
      </div>
    </div>
  );
}
