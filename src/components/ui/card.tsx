import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHead({
  left,
  right,
  className,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-[color:var(--border)] px-4 py-2.5",
        className,
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
        {left}
      </div>
      {right !== undefined && (
        <div className="font-mono text-[11px] text-[color:var(--fg-4)]">
          {right}
        </div>
      )}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
