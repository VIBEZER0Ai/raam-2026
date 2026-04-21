"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "./actions";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const res = await sendMagicLink({ email, next });
      if (res.ok) {
        setMsg(`Magic link sent to ${email}. Check your inbox.`);
      } else {
        setErr(res.error);
      }
    });
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      <input
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 text-[14px] text-[color:var(--fg)] outline-none focus:border-[color:var(--strava-orange)]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || !email}
        className={cn(
          "rounded-lg bg-[color:var(--strava-orange)] px-4 py-3 text-[14px] font-bold text-white transition-opacity",
          (pending || !email) && "opacity-50",
        )}
      >
        {pending ? "Sending…" : "Send magic link"}
      </button>
      {msg && (
        <div className="rounded-lg border border-emerald-900/50 bg-emerald-500/10 p-3 text-[12px] text-emerald-300">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-lg border border-red-900/50 bg-red-500/10 p-3 text-[12px] text-red-300">
          {err}
        </div>
      )}
    </div>
  );
}
