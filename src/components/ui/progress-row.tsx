import { cn } from "@/lib/utils";

export function ProgressRow({
  label,
  value,
  max,
  unit,
  color = "#34d399",
  className,
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("flex items-center gap-2.5 py-1.5", className)}>
      <div className="min-w-[90px] text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
        {label}
      </div>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--bg-row)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="min-w-[110px] text-right font-mono text-[11px] tabular-nums text-[color:var(--fg-2)]">
        {value}
        {unit ? ` ${unit}` : ""} / {max}
        {unit ? ` ${unit}` : ""}
      </div>
    </div>
  );
}
