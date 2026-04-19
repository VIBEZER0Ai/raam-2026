"use client";

import { cn } from "@/lib/utils";

export function QuickLogButton({
  value,
  unit,
  onClick,
  className,
}: {
  value: React.ReactNode;
  unit: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-xl font-bold text-[color:var(--fg)] transition-transform duration-150 active:scale-[0.98] active:border-[color:var(--strava-orange)] active:bg-[color:var(--strava-orange)] active:text-white",
        className,
      )}
    >
      <span>{value}</span>
      <span className="font-mono text-[11px] font-medium lowercase text-[color:var(--fg-4)]">
        {unit}
      </span>
    </button>
  );
}
