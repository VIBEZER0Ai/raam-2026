"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Mail,
  Plus,
  Trash2,
  Watch,
  Users,
} from "lucide-react";
import {
  inviteTeamCrew,
  markTeamOnboarded,
  type CrewInvite,
  type InviteRole,
} from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";

export interface OnboardingWizardProps {
  teamId: string;
  teamSlug: string;
  teamName: string;
  alreadyOnboarded?: boolean;
}

type Step = 0 | 1 | 2 | 3;

export function OnboardingWizard({
  teamId,
  teamSlug,
  teamName,
  alreadyOnboarded,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [pending, startTransition] = useTransition();
  const [invites, setInvites] = useState<CrewInvite[]>([
    { email: "", full_name: "", role: "crew" },
  ]);
  const [inviteResult, setInviteResult] = useState<{
    invited: number;
    failed: { email: string; error: string }[];
  } | null>(null);

  const TOTAL = 4;

  const updateInvite = (idx: number, patch: Partial<CrewInvite>) => {
    setInvites((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    );
  };
  const addRow = () =>
    setInvites((rows) => [...rows, { email: "", full_name: "", role: "crew" }]);
  const removeRow = (idx: number) =>
    setInvites((rows) => rows.filter((_, i) => i !== idx));

  const sendInvites = () =>
    startTransition(async () => {
      const valid = invites.filter((r) => r.email.trim().includes("@"));
      if (valid.length === 0) {
        setStep(2);
        return;
      }
      const res = await inviteTeamCrew(teamId, valid);
      if (res.ok) {
        setInviteResult({ invited: res.invited, failed: res.failed });
        setStep(2);
      } else {
        setInviteResult({
          invited: 0,
          failed: [{ email: "—", error: res.error }],
        });
      }
    });

  const finish = () =>
    startTransition(async () => {
      await markTeamOnboarded(teamId);
      router.push(`/team/${teamSlug}?welcome=1`);
    });

  return (
    <main className="mx-auto max-w-2xl py-6 sm:py-10">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
          Ventor · {teamName}
        </div>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-[-0.01em] sm:text-[30px]">
          {step === 0 && "Welcome to your race control room"}
          {step === 1 && "Invite your crew"}
          {step === 2 && "Connect Whoop"}
          {step === 3 && "You’re live"}
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--fg-3)]">
          Step {Math.min(step + 1, TOTAL)} of {TOTAL}
          {alreadyOnboarded && " · team already set up — revisiting"}
        </p>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2, 3].map((n) => (
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
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <IntroCard
            icon={<Users className="h-5 w-5" />}
            title="One account, one operating model"
            body={`You’ll invite crew by email. Each crew member gets a magic-link sign-in. Their role (chief, crew, observer, rider) controls what they can change on ${teamName}.`}
          />
          <IntroCard
            icon={<Watch className="h-5 w-5" />}
            title="Connect Whoop for the rider"
            body="Ventor auto-pulls recovery, HRV, resting HR, and sleep every 30 minutes. Feeds the readiness widget and the rule engine’s fatigue alerts."
          />
          <IntroCard
            icon={<Check className="h-5 w-5" />}
            title="Then you’re live"
            body="War Room, time-station tracker, nutrition + sleep logging, Compliance alerts, public Spectator view. All powered by the event template you picked."
          />
          <Actions>
            <NextBtn onClick={() => setStep(1)}>
              Invite crew
              <ChevronRight className="h-4 w-4" />
            </NextBtn>
          </Actions>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-[color:var(--fg-3)]">
            Add every crew member that needs access. Each gets a branded magic
            link invite. You can add more later at{" "}
            <code className="rounded bg-[color:var(--bg-elev)] px-1 py-0.5 font-mono text-[11px]">
              /admin/roster
            </code>
            .
          </p>

          <div className="flex flex-col gap-2">
            {invites.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 sm:grid-cols-[1.2fr_1fr_auto_auto]"
              >
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={row.email}
                  onChange={(e) =>
                    updateInvite(i, { email: e.target.value })
                  }
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px]"
                />
                <input
                  type="text"
                  placeholder="Full name (optional)"
                  value={row.full_name ?? ""}
                  onChange={(e) =>
                    updateInvite(i, { full_name: e.target.value })
                  }
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px]"
                />
                <select
                  value={row.role}
                  onChange={(e) =>
                    updateInvite(i, {
                      role: e.target.value as InviteRole,
                    })
                  }
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-2 py-2 text-[13px]"
                >
                  <option value="chief">Chief</option>
                  <option value="crew">Crew</option>
                  <option value="rider">Rider</option>
                  <option value="observer">Observer</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={invites.length === 1}
                  className={cn(
                    "flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--fg-3)] hover:border-red-500/60 hover:text-red-400",
                    invites.length === 1 && "opacity-40 pointer-events-none",
                  )}
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 self-start rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-3 py-1.5 text-[12px] font-semibold text-[color:var(--fg-2)] hover:border-[color:var(--border-strong)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another
            </button>
          </div>

          {inviteResult && (
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 text-[12px]">
              <div className="flex items-center gap-2 text-[color:var(--emerald-400)]">
                <Mail className="h-4 w-4" />
                Sent {inviteResult.invited} invite
                {inviteResult.invited === 1 ? "" : "s"}.
              </div>
              {inviteResult.failed.length > 0 && (
                <ul className="mt-2 flex flex-col gap-0.5 text-[color:var(--red-400)]">
                  {inviteResult.failed.map((f, i) => (
                    <li key={i}>
                      {f.email}: {f.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Actions>
            <BackBtn onClick={() => setStep(0)} />
            <NextBtn
              onClick={sendInvites}
              disabled={pending}
              variant="primary"
            >
              {pending ? "Sending…" : "Send invites & continue"}
              <ChevronRight className="h-4 w-4" />
            </NextBtn>
            <SkipBtn onClick={() => setStep(2)}>Skip for now</SkipBtn>
          </Actions>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-[color:var(--fg-3)]">
            If your rider wears Whoop, connect once to auto-pull recovery, HRV,
            and sleep every 30 minutes. Feeds the readiness widget on War Room.
          </p>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5">
            <div className="flex items-center gap-3">
              <Watch className="h-6 w-6 text-[color:var(--emerald-400)]" />
              <div>
                <div className="text-[14px] font-bold">
                  Whoop OAuth
                </div>
                <div className="text-[12px] text-[color:var(--fg-3)]">
                  30-second connect · disconnect anytime
                </div>
              </div>
            </div>
            <Link
              href="/admin/roster"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[12px] font-extrabold text-white"
            >
              Go to roster → click rider → Connect Whoop
            </Link>
            <p className="mt-2 text-[11px] text-[color:var(--fg-4)]">
              You can connect now in a new tab and come back here.
            </p>
          </div>
          <Actions>
            <BackBtn onClick={() => setStep(1)} />
            <NextBtn onClick={() => setStep(3)} variant="primary">
              Continue
              <ChevronRight className="h-4 w-4" />
            </NextBtn>
            <SkipBtn onClick={() => setStep(3)}>Skip</SkipBtn>
          </Actions>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-2 text-[color:var(--emerald-400)]">
              <Check className="h-5 w-5" />
              <div className="text-[14px] font-extrabold">
                {teamName} is live
              </div>
            </div>
            <p className="mt-2 text-[13px] text-[color:var(--fg-2)]">
              Your race control room is set up. Jump into War Room to see live
              data when your rider starts sending GPS pings — or explore the
              other tabs while you wait.
            </p>
          </div>

          <IntroCard
            icon={<Check className="h-5 w-5" />}
            title="Public tracker"
            body={`Your spectator page is live at ventor.fit/spectator/${teamSlug} — share with family and sponsors.`}
          />
          <IntroCard
            icon={<Check className="h-5 w-5" />}
            title="Race-day cron"
            body="The rule engine auto-runs every 5 minutes. Discord alerts fire for criticals. No manual action needed during the race."
          />

          <Actions>
            <NextBtn
              onClick={finish}
              disabled={pending}
              variant="primary"
            >
              {pending ? "Finishing…" : "Go to War Room"}
              <ChevronRight className="h-4 w-4" />
            </NextBtn>
          </Actions>
        </div>
      )}
    </main>
  );
}

/* ---------- subcomponents ---------- */

function IntroCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4">
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[color:var(--strava-orange)]"
        style={{ background: "rgba(252,76,2,0.12)" }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[14px] font-extrabold tracking-[-0.01em]">
          {title}
        </div>
        <div className="mt-0.5 text-[13px] leading-relaxed text-[color:var(--fg-3)]">
          {body}
        </div>
      </div>
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">{children}</div>
  );
}

function NextBtn({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-extrabold",
        variant === "primary"
          ? "bg-[color:var(--strava-orange)] text-white"
          : "border border-[color:var(--border)] bg-[color:var(--bg-elev)]",
        disabled && "opacity-50",
      )}
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-4 py-2 text-[13px] font-bold text-[color:var(--fg-3)]"
    >
      Back
    </button>
  );
}

function SkipBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-4 py-2 text-[12px] font-semibold text-[color:var(--fg-4)] hover:text-[color:var(--fg-2)]"
    >
      {children}
    </button>
  );
}
