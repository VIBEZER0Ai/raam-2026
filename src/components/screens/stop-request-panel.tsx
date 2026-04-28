"use client";

import { useState, useTransition } from "react";
import {
  Coffee,
  Pizza,
  Wrench,
  HeartPulse,
  Bed,
  Camera,
  HelpCircle,
  X,
  Check,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  createStopRequest,
  ackStopRequest,
  dispatchStopRequest,
  cancelStopRequest,
  type StopReason,
} from "@/app/actions/stop-request";
import type { DbStopRequest } from "@/lib/db/queries";
import { useTick } from "@/lib/raam/use-tick";
import { cn } from "@/lib/utils";

const REASONS: {
  reason: StopReason;
  label: string;
  Icon: typeof Coffee;
  fast?: boolean;
}[] = [
  { reason: "loo",     label: "Loo break",  Icon: HelpCircle },
  { reason: "food",    label: "Food",       Icon: Pizza },
  { reason: "mech",    label: "Mech",       Icon: Wrench, fast: true },
  { reason: "medical", label: "Medical",    Icon: HeartPulse, fast: true },
  { reason: "sleep",   label: "Sleep",      Icon: Bed },
  { reason: "media",   label: "Media",      Icon: Camera },
  { reason: "other",   label: "Other",      Icon: Coffee },
];

export function StopRequestPanel({
  active,
}: {
  active: DbStopRequest[];
}) {
  useTick(1000); // re-render so the countdown updates every second

  const [open, setOpen] = useState(false);
  const [pickedReason, setPickedReason] = useState<StopReason | null>(null);
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    if (!pickedReason) return;
    start(async () => {
      await createStopRequest({ reason: pickedReason, notes: notes || undefined });
      setOpen(false);
      setPickedReason(null);
      setNotes("");
    });
  };

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)]">
      <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[color:var(--strava-orange)]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[color:var(--fg-1)]">
            Stop requests
          </span>
          <span className="rounded-full bg-[color:var(--bg)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--fg-3)]">
            {active.filter((a) => a.status !== "cancelled").length}
          </span>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-[color:var(--strava-orange)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:opacity-90"
          >
            + Request stop
          </button>
        )}
      </div>

      {open && (
        <div className="border-b border-[color:var(--border)] p-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
            Reason
          </div>
          <div className="flex flex-wrap gap-2">
            {REASONS.map(({ reason, label, Icon, fast }) => (
              <button
                key={reason}
                type="button"
                onClick={() => setPickedReason(reason)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold",
                  pickedReason === reason
                    ? "border-[color:var(--strava-orange)] bg-[color:var(--strava-orange)]/15 text-[color:var(--fg-1)]"
                    : "border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--fg-2)] hover:border-[color:var(--border-strong)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {fast && (
                  <span className="rounded-sm bg-red-500/20 px-1 py-0 text-[8px] font-bold text-red-400">
                    NOW
                  </span>
                )}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="mt-3 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[12px] text-[color:var(--fg-1)] placeholder:text-[color:var(--fg-5)] focus:border-[color:var(--border-strong)] focus:outline-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPickedReason(null);
              }}
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-1.5 text-[11px] font-semibold text-[color:var(--fg-2)] hover:border-[color:var(--border-strong)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!pickedReason || pending}
              className="rounded-lg bg-[color:var(--strava-orange)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending
                ? "Sending…"
                : pickedReason && ["mech", "medical"].includes(pickedReason)
                ? "Dispatch NOW"
                : "Send · 15 min heads-up"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {active.length === 0 ? (
          <div className="px-4 py-3 text-[12px] text-[color:var(--fg-4)]">
            No active stop requests.
          </div>
        ) : (
          active.map((r) => <StopRow key={r.id} req={r} />)
        )}
      </div>
    </div>
  );
}

function StopRow({ req }: { req: DbStopRequest }) {
  const [pending, start] = useTransition();
  const dispatchAtMs = new Date(req.dispatch_at).getTime();
  // useTick(1000) on the parent re-renders this row every second, so reading
  // wall-clock time directly here is intentional (matches the pattern used
  // elsewhere in chrome/top-nav.tsx).
  // eslint-disable-next-line react-hooks/purity
  const countdownMs = dispatchAtMs - Date.now();
  const overdue = countdownMs < 0;
  const mm = Math.max(0, Math.floor(Math.abs(countdownMs) / 60_000));
  const ss = Math.max(0, Math.floor((Math.abs(countdownMs) % 60_000) / 1000));
  const reasonMeta = REASONS.find((r) => r.reason === req.reason);
  const Icon = reasonMeta?.Icon ?? HelpCircle;

  const ack = () => start(async () => { await ackStopRequest(req.id); });
  const dispatch = () => start(async () => { await dispatchStopRequest(req.id); });
  const cancel = () => start(async () => { await cancelStopRequest(req.id); });

  return (
    <div className="border-b border-[color:var(--border-soft)] px-4 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
              req.is_emergency
                ? "bg-red-500/20 text-red-400"
                : "bg-[color:var(--bg)] text-[color:var(--fg-3)]",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[13px] font-bold capitalize text-[color:var(--fg-1)]">
                {req.reason}
              </span>
              {req.is_emergency && (
                <span className="rounded-sm bg-red-500/20 px-1 py-0 text-[8px] font-bold uppercase tracking-[0.12em] text-red-400">
                  Fast-path
                </span>
              )}
              <span className="text-[11px] text-[color:var(--fg-4)]">
                · {req.requested_by_label ?? "crew"}
              </span>
            </div>
            {req.notes && (
              <div className="mt-0.5 text-[12px] text-[color:var(--fg-3)]">
                {req.notes}
              </div>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.1em]">
              <StatusPill status={req.status} />
              {req.status === "pending" && (
                <span
                  className={cn(
                    "tabular-nums",
                    overdue ? "text-emerald-400" : "text-[color:var(--fg-3)]",
                  )}
                >
                  {overdue ? "ready " : "T- "}
                  {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
                </span>
              )}
              {req.rider_acknowledged_at && (
                <span className="text-emerald-400">rider ack ✓</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {req.status === "pending" && !req.rider_acknowledged_at && (
            <button
              type="button"
              onClick={ack}
              disabled={pending}
              title="Rider acknowledge"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          {(req.status === "pending" || req.status === "acknowledged") && (
            <button
              type="button"
              onClick={dispatch}
              disabled={pending}
              title="Mark dispatched (rider stopped)"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 disabled:opacity-50"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {req.status !== "dispatched" && req.status !== "cancelled" && (
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              title="Cancel"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--fg-3)] hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: DbStopRequest["status"] }) {
  const cfg = {
    pending:      "border-amber-400/40 bg-amber-400/10 text-amber-400",
    acknowledged: "border-sky-400/40 bg-sky-400/10 text-sky-400",
    dispatched:   "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
    cancelled:    "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[9px]",
        cfg,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}
