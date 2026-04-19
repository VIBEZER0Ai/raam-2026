import { cn } from "@/lib/utils";

type BadgeKind = "passed" | "current" | "up" | "danger" | "cp";

const STYLES: Record<BadgeKind, string> = {
  passed:  "bg-emerald-500/15 text-emerald-400",
  current: "bg-[color:var(--strava-orange)] text-white",
  up:      "bg-[color:var(--bg-row)] text-[color:var(--fg-2)]",
  danger:  "bg-red-500/15 text-red-400",
  cp:      "bg-amber-400/15 text-amber-400",
};

export function TSBadge({
  num,
  kind = "up",
  className,
}: {
  num: number;
  kind?: BadgeKind;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-[30px] w-[50px] flex-shrink-0 items-center justify-center rounded-[5px] font-mono text-[11px] font-bold",
        STYLES[kind],
        className,
      )}
    >
      TS{num}
    </span>
  );
}
