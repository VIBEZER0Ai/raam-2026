import { cn } from "@/lib/utils";
import type { MockAlert } from "@/lib/raam/mock-data";

const SEV_STYLES: Record<
  MockAlert["sev"],
  { wrapper: string; tag: string; tagText: string }
> = {
  CRITICAL: {
    wrapper: "border-[rgba(127,29,29,0.6)] bg-red-500/12 text-red-200",
    tag: "bg-red-500 text-white pulse-red",
    tagText: "text-white",
  },
  WARN: {
    wrapper: "border-[rgba(154,52,18,0.6)] bg-orange-400/10 text-orange-200",
    tag: "bg-orange-400 text-[#1c1917]",
    tagText: "",
  },
  INFO: {
    wrapper: "border-[rgba(49,46,129,0.6)] bg-indigo-500/10 text-indigo-200",
    tag: "bg-indigo-400 text-[#0b0820]",
    tagText: "",
  },
  AMBER: {
    wrapper: "border-[rgba(120,53,15,0.6)] bg-amber-400/10 text-amber-200",
    tag: "bg-amber-400 text-[#1c1917]",
    tagText: "",
  },
};

export function AlertBanner({
  alert,
  onAck,
  className,
}: {
  alert: MockAlert;
  onAck?: () => void;
  className?: string;
}) {
  const s = SEV_STYLES[alert.sev];
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[10px] border px-4 py-3",
        s.wrapper,
        className,
      )}
    >
      <span
        className={cn(
          "rounded-sm px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em]",
          s.tag,
        )}
      >
        {alert.sev}
      </span>
      <div className="flex-1 text-[13px] font-semibold leading-snug">
        {alert.title}
      </div>
      <span className="hidden font-mono text-[11px] opacity-80 md:inline">
        {alert.meta}
      </span>
      <button
        type="button"
        onClick={onAck}
        className="rounded border border-current px-2 py-1 font-mono text-[11px] opacity-60 transition-opacity hover:opacity-100"
      >
        ACK
      </button>
    </div>
  );
}
