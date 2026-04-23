"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam, type SignupTeamInput } from "@/app/actions/signup-team";
import { cn } from "@/lib/utils";

interface Template {
  code: string;
  name: string;
  sport: string;
  discipline: string | null;
  total_miles: number | null;
  total_km: number | null;
}

const SPORT_LABEL: Record<string, string> = {
  cycling: "Cycling",
  running: "Running",
  triathlon: "Triathlon",
  bikepacking: "Bikepacking",
  multi: "Multi-sport",
  other: "Other",
};

export function SignupWizard({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SignupTeamInput>({
    name: "",
    slug: "",
    sport: "cycling",
    event_code: null,
  });
  const [err, setErr] = useState<string | null>(null);

  const pickTemplate = (t: Template) => {
    setForm((f) => ({
      ...f,
      event_code: t.code,
      sport: (t.sport as SignupTeamInput["sport"]) ?? f.sport,
      name: f.name || t.name,
    }));
    setStep(2);
  };

  const onSlug = (v: string) =>
    setForm((f) => ({
      ...f,
      slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40),
    }));

  const submit = () =>
    startTransition(async () => {
      setErr(null);
      const res = await createTeam(form);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.push(`/team/${res.slug}`);
    });

  const grouped = Object.entries(
    templates.reduce<Record<string, Template[]>>((acc, t) => {
      (acc[t.sport] ||= []).push(t);
      return acc;
    }, {}),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
          Ventor · create a team
        </div>
        <h1 className="mt-1 text-[26px] font-extrabold">
          {step === 1 && "Pick your event"}
          {step === 2 && "Name your team"}
          {step === 3 && "You’re set"}
        </h1>
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={cn(
                "h-1 flex-1 rounded",
                n <= step
                  ? "bg-[color:var(--strava-orange)]"
                  : "bg-[color:var(--border)]",
              )}
            />
          ))}
        </div>
      </header>

      {step === 1 && (
        <div className="flex flex-col gap-5">
          {grouped.map(([sport, rows]) => (
            <section key={sport}>
              <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--fg-3)]">
                {SPORT_LABEL[sport] ?? sport}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {rows.map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => pickTemplate(t)}
                    className="flex flex-col items-start gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 text-left transition-colors hover:border-[color:var(--strava-orange)]"
                  >
                    <span className="text-[14px] font-bold text-[color:var(--fg-1)]">
                      {t.name}
                    </span>
                    <span className="text-[11px] text-[color:var(--fg-3)]">
                      {t.discipline ?? "—"}
                      {t.total_miles
                        ? ` · ${t.total_miles} mi`
                        : t.total_km
                          ? ` · ${t.total_km} km`
                          : ""}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
              Team name
            </span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Team Kabir · RAAM 2026"
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[14px]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
              URL slug
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[color:var(--fg-3)]">
                ventor.fit/team/
              </span>
              <input
                value={form.slug}
                onChange={(e) => onSlug(e.target.value)}
                placeholder="kabir-raam-2026"
                className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px]"
              />
            </div>
          </label>

          {err && (
            <div className="rounded-lg border border-red-900/50 bg-red-500/10 p-2 text-[12px] text-red-300">
              {err}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-[13px] font-bold text-[color:var(--fg-3)]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !form.name.trim() || !form.slug}
              className={cn(
                "rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white",
                (pending || !form.name.trim() || !form.slug) && "opacity-50",
              )}
            >
              {pending ? "Creating…" : "Create team"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
