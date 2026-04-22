"use client";

import { useState, useTransition } from "react";
import { runEngineNow } from "@/app/actions/engine";
import { cn } from "@/lib/utils";

export function RunEngineButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [isErr, setIsErr] = useState(false);

  const handle = () =>
    startTransition(async () => {
      setMsg(null);
      const res = await runEngineNow();
      if (res.ok) {
        const s = res.summary;
        const parts = [
          `evaluated ${s.evaluated}`,
          `persisted ${s.persisted}`,
          `dedup ${s.dedup_skipped}`,
          `discord ${s.discord_sent}/${s.discord_sent + s.discord_failed + s.discord_skipped}`,
        ];
        setIsErr(false);
        setMsg(parts.join(" · "));
      } else {
        setIsErr(true);
        setMsg(res.error);
      }
      setTimeout(() => setMsg(null), 6000);
    });

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className={cn(
          "rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[12px] font-extrabold text-white transition-opacity",
          pending && "opacity-50",
        )}
      >
        {pending ? "Running…" : "Run engine now"}
      </button>
      {msg && (
        <span
          className={cn(
            "font-mono text-[11px]",
            isErr ? "text-red-400" : "text-emerald-400",
          )}
        >
          {msg}
        </span>
      )}
    </div>
  );
}
