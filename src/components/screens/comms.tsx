/**
 * /comms — Discord + crew message feed.
 * Source: comms_log, inbound from RAAM HQ Discord (channel='discord', direction='in').
 */

import { Card, CardHead } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { fmtPingAge } from "@/lib/raam/format";
import type { DbCommsLog } from "@/lib/db/queries";

export interface CommsProps {
  messages: DbCommsLog[];
}

export function Comms({ messages }: CommsProps) {
  const inboundCount = messages.filter((m) => m.direction === "in").length;
  const outboundCount = messages.filter((m) => m.direction === "out").length;
  const discordCount = messages.filter((m) => m.channel === "discord").length;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid gap-3.5 md:grid-cols-4">
        <Stat label="Messages" value={`${messages.length}`} />
        <Stat label="Discord" value={`${discordCount}`} />
        <Stat label="Inbound" value={`${inboundCount}`} emerald />
        <Stat label="Outbound" value={`${outboundCount}`} orange />
      </div>

      <Card>
        <CardHead
          left={`Feed · newest ${messages.length}`}
          right={
            <span className="font-mono">
              POST /api/discord/inbound to append
            </span>
          }
        />
        <div className="flex flex-col">
          {messages.length === 0 && (
            <div className="px-4 py-8 text-center text-[12px] text-[color:var(--fg-4)]">
              No messages yet. Configure your Discord relay to POST here.
            </div>
          )}
          {messages.map((m) => (
            <MessageRow key={m.id} m={m} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  emerald,
  orange,
}: {
  label: string;
  value: string;
  emerald?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
        {label}
      </div>
      <div
        className={[
          "mt-2 font-mono text-[26px] font-bold leading-none tabular-nums",
          emerald ? "text-emerald-400" : "",
          orange ? "text-[color:var(--strava-orange)]" : "",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function MessageRow({ m }: { m: DbCommsLog }) {
  const isDiscord = m.channel === "discord";
  const isInbound = m.direction === "in";
  return (
    <div className="border-b border-[color:var(--border-soft)] px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <span
          className={[
            "rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em]",
            isDiscord
              ? "bg-indigo-500/15 text-indigo-400"
              : "bg-[color:var(--bg-row)] text-[color:var(--fg-3)]",
          ].join(" ")}
        >
          {m.channel}
        </span>
        <Pill kind={isInbound ? "INFO" : "WARN"}>
          {isInbound ? "IN" : "OUT"}
        </Pill>
        <span className="text-[12px] font-bold text-[color:var(--fg-1)]">
          {m.from_party ?? "unknown"}
        </span>
        {m.to_party && (
          <span className="font-mono text-[10px] text-[color:var(--fg-4)]">
            → {m.to_party}
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-[color:var(--fg-4)]">
          {fmtPingAge(m.ts)} ago
        </span>
      </div>
      {m.body && (
        <div className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.5] text-[color:var(--fg-1)]">
          {m.body}
        </div>
      )}
    </div>
  );
}
