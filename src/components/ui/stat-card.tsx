import { cn } from "@/lib/utils";

type ValueKind = "default" | "orange" | "emerald" | "red" | "amber";
const VALUE_COLOR: Record<ValueKind, string> = {
  default:  "text-[color:var(--fg)]",
  orange:   "text-[color:var(--strava-orange)]",
  emerald:  "text-emerald-400",
  red:      "text-red-400",
  amber:    "text-amber-400",
};

type SubKind = "default" | "emerald" | "red" | "amber";
const SUB_COLOR: Record<SubKind, string> = {
  default: "text-[color:var(--fg-4)]",
  emerald: "text-emerald-400",
  red:     "text-red-400",
  amber:   "text-amber-400",
};

export interface StatCardProps {
  eyebrow: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  subKind?: SubKind;
  valueKind?: ValueKind;
  progress?: number; // 0-100
  live?: boolean;
  className?: string;
}

export function StatCard({
  eyebrow,
  value,
  sub,
  subKind = "default",
  valueKind = "default",
  progress,
  live,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[132px] flex-col gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)] p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase leading-none tracking-[0.2em] text-[color:var(--fg-3)]">
        <span>{eyebrow}</span>
        {live && (
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[color:var(--strava-orange)]" />
        )}
      </div>
      <div
        className={cn(
          "font-mono text-[34px] font-bold leading-none tabular-nums",
          VALUE_COLOR[valueKind],
        )}
      >
        {value}
      </div>
      {sub !== undefined && (
        <div className={cn("font-mono text-[11px]", SUB_COLOR[subKind])}>
          {sub}
        </div>
      )}
      {typeof progress === "number" && (
        <div className="mt-1 h-[5px] overflow-hidden rounded-full bg-[color:var(--bg-row)]">
          <span
            className="block h-full rounded-full bg-[color:var(--strava-orange)]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
