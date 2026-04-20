"use client";

import { useState, useTransition } from "react";
import { logPenalty } from "@/app/actions/penalty";
import { cn } from "@/lib/utils";

const KIND_OPTIONS = [
  { value: "warning", label: "Warning" },
  { value: "penalty_1h", label: "Penalty · 1 hour" },
  { value: "dq", label: "DQ" },
] as const;

export function PenaltyLogForm() {
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState<"warning" | "penalty_1h" | "dq">(
    "warning",
  );
  const [ruleRef, setRuleRef] = useState("");
  const [description, setDescription] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [tsNum, setTsNum] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const submit = () => {
    if (!description.trim()) {
      setResult("Description required");
      return;
    }
    startTransition(async () => {
      setResult(null);
      const res = await logPenalty({
        kind,
        rule_ref: ruleRef.trim() || undefined,
        description: description.trim(),
        issued_by: issuedBy.trim() || undefined,
        ts_num: tsNum ? Number(tsNum) : undefined,
      });
      if (res.ok) {
        setResult("Logged.");
        setDescription("");
        setRuleRef("");
        setIssuedBy("");
        setTsNum("");
        setTimeout(() => setResult(null), 2000);
      } else {
        setResult(`Error: ${res.error}`);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
        Log penalty / warning
      </div>
      <div className="grid gap-2.5 sm:grid-cols-[150px_120px_1fr]">
        <select
          value={kind}
          onChange={(e) =>
            setKind(e.target.value as "warning" | "penalty_1h" | "dq")
          }
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Rule (e.g. 1460)"
          value={ruleRef}
          onChange={(e) => setRuleRef(e.target.value)}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
        <input
          type="number"
          min={0}
          max={54}
          placeholder="TS # (optional)"
          value={tsNum}
          onChange={(e) => setTsNum(e.target.value)}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
      </div>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
      />
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          placeholder="Issued by (Race Official name)"
          value={issuedBy}
          onChange={(e) => setIssuedBy(e.target.value)}
          className="flex-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={cn(
            "rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white transition-opacity",
            pending && "opacity-50",
          )}
        >
          {pending ? "Logging…" : "Log"}
        </button>
      </div>
      {result && (
        <div
          className={cn(
            "font-mono text-[11px]",
            result.startsWith("Error") ? "text-red-400" : "text-emerald-400",
          )}
        >
          {result}
        </div>
      )}
    </div>
  );
}
