import { cn } from "@/lib/utils";

export type PillKind =
  | "ON DUTY"
  | "SLEEPING"
  | "DRIVING"
  | "OFF"
  | "CRITICAL"
  | "WARN"
  | "INFO"
  | "AMBER"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

const KIND_STYLES: Record<PillKind, string> = {
  "ON DUTY":  "bg-emerald-500/15 border-emerald-900/60 text-emerald-400",
  "SLEEPING": "bg-blue-500/15 border-blue-900/60 text-blue-400",
  "DRIVING":  "bg-orange-500/15 border-[rgba(176,51,0,0.6)] text-[color:var(--strava-orange)]",
  "OFF":      "bg-zinc-500/15 border-zinc-800/80 text-zinc-400",
  "CRITICAL": "bg-red-500/15 border-red-900/60 text-red-400",
  "WARN":     "bg-orange-400/15 border-[rgba(154,52,18,0.6)] text-orange-400",
  "INFO":     "bg-indigo-500/15 border-indigo-900/60 text-indigo-400",
  "AMBER":    "bg-amber-400/15 border-amber-900/60 text-amber-400",
  "HIGH":     "bg-orange-400/15 border-[rgba(154,52,18,0.6)] text-orange-400",
  "MEDIUM":   "bg-amber-400/15 border-amber-900/60 text-amber-400",
  "LOW":      "bg-emerald-500/15 border-emerald-900/60 text-emerald-400",
};

const DOT_KINDS: PillKind[] = ["ON DUTY", "SLEEPING", "DRIVING", "OFF"];
const DOT_STYLES: Partial<Record<PillKind, string>> = {
  "ON DUTY":  "bg-emerald-400",
  "SLEEPING": "bg-blue-400",
  "DRIVING":  "bg-[color:var(--strava-orange)]",
  "OFF":      "bg-zinc-400",
};

interface PillProps {
  kind: PillKind;
  children?: React.ReactNode;
  className?: string;
}

export function Pill({ kind, children, className }: PillProps) {
  const withDot = DOT_KINDS.includes(kind);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-bold uppercase leading-[1.4] tracking-[0.08em]",
        KIND_STYLES[kind],
        className,
      )}
    >
      {withDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[kind])} />
      )}
      {children ?? kind}
    </span>
  );
}
