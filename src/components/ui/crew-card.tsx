import { Pill, type PillKind } from "./pill";
import { cn } from "@/lib/utils";

export interface CrewCardData {
  id: string;
  initials: string;
  name: string;
  role: string;
  color: string;
  vehicle: string;
  status: PillKind;
  loc: string;
  tag: string;
}

export function CrewCard({
  c,
  className,
}: {
  c: CrewCardData;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[72px] items-center gap-2.5 rounded-[10px] border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)] p-3",
        className,
      )}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-[#0a0a0a]"
        style={{ background: c.color }}
      >
        {c.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-[color:var(--fg-1)]">
          {c.name}
        </div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
          {c.role} · {c.vehicle}
        </div>
        <div className="mt-1 truncate font-mono text-[11px] text-[color:var(--fg-4)]">
          {c.loc} · {c.tag}
        </div>
      </div>
      <Pill kind={c.status} />
    </div>
  );
}
