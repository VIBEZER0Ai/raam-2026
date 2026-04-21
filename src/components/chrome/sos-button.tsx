"use client";

import { useState, useTransition } from "react";
import { triggerSOS } from "@/app/actions/sos";
import { cn } from "@/lib/utils";

/**
 * SOS trigger in TopNav. Click opens a confirm modal with:
 *   - optional short note
 *   - HOLD-to-confirm 1.5 s (prevents accidental pocket-press)
 *   - calls triggerSOS server action
 *   - shows result (DB / Discord / location)
 */
export function SosButton() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    ok: boolean;
    msg: string;
    alertId?: string;
  } | null>(null);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const fire = () => {
    startTransition(async () => {
      setResult(null);
      const res = await triggerSOS({ note: note.trim() || undefined });
      if (res.ok) {
        const parts = [
          "SOS armed.",
          res.discord === "sent"
            ? "Discord posted."
            : res.discord === "failed"
              ? "Discord failed (check DISCORD_WEBHOOK_URL)."
              : "Discord skipped (not configured).",
          res.location
            ? `Position: ${res.location.lat.toFixed(5)}, ${res.location.lng.toFixed(5)}`
            : "No recent GPS.",
        ];
        setResult({ ok: true, msg: parts.join(" "), alertId: res.alertId });
        setNote("");
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 4500);
      } else {
        setResult({ ok: false, msg: res.error ?? "failed" });
      }
    });
  };

  const startHold = () => {
    setHolding(true);
    setHoldProgress(0);
    const start = Date.now();
    const step = 30;
    const total = 1500;
    const id = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / total) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        setHolding(false);
        fire();
      }
    }, step);
    return () => clearInterval(id);
  };

  const cancelHold = () => {
    setHolding(false);
    setHoldProgress(0);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setResult(null);
        }}
        className="h-9 rounded-lg border-0 bg-red-500 px-3.5 text-[12px] font-extrabold tracking-[0.12em] text-white shadow-[0_0_0_2px_rgba(239,68,68,0.3)]"
      >
        SOS
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => !pending && !holding && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-500/50 bg-[color:var(--bg-elev)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-sm bg-red-500 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
                SOS
              </span>
              <div className="text-[16px] font-extrabold">Emergency broadcast</div>
            </div>
            <p className="mb-4 text-[12px] leading-[1.5] text-[color:var(--fg-3)]">
              Creates a critical alert, logs it, and pings the crew Discord
              channel with <span className="font-mono">@here</span>. Use for real
              safety events only — crew expected to respond immediately.
            </p>

            <textarea
              placeholder="Optional note (what's happening, where, what you need)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={140}
              disabled={pending || holding}
              className="w-full resize-none rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] p-3 text-[13px] text-[color:var(--fg)] outline-none focus:border-red-500"
              rows={3}
            />
            <div className="mt-1 text-right font-mono text-[10px] text-[color:var(--fg-4)]">
              {note.length} / 140
            </div>

            {result && (
              <div
                className={cn(
                  "mt-3 rounded-lg border p-3 text-[12px]",
                  result.ok
                    ? "border-emerald-900/50 bg-emerald-500/10 text-emerald-300"
                    : "border-red-900/50 bg-red-500/10 text-red-300",
                )}
              >
                {result.msg}
                {result.alertId && (
                  <div className="mt-1 font-mono text-[10px] opacity-60">
                    alert id · {result.alertId.slice(0, 8)}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => !pending && !holding && setOpen(false)}
                className="rounded-lg border border-[color:var(--border)] bg-transparent px-4 py-2 text-[13px] font-bold text-[color:var(--fg-3)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                disabled={pending}
                className={cn(
                  "relative flex-1 overflow-hidden rounded-lg bg-red-500 py-3 text-[13px] font-extrabold tracking-[0.12em] text-white transition-opacity",
                  pending && "opacity-50",
                )}
              >
                <span
                  className="absolute inset-y-0 left-0 bg-red-700 transition-[width] duration-75"
                  style={{ width: `${holdProgress}%` }}
                />
                <span className="relative">
                  {pending
                    ? "FIRING…"
                    : holding
                      ? `HOLD ${Math.round(holdProgress)}%`
                      : "HOLD 1.5s TO FIRE"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
