"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import type { BikeCatalog } from "@/lib/raam/bike-catalog";
import { cn } from "@/lib/utils";
import {
  Bike,
  FileText,
  Search,
  Sparkles,
  Wrench,
  ExternalLink,
} from "lucide-react";

const TYPE_COLOR: Record<string, string> = {
  "road-endurance": "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  "road-aero":      "border-sky-400/40 bg-sky-400/10 text-sky-300",
  "time-trial":     "border-purple-400/40 bg-purple-400/10 text-purple-300",
  "default":        "border-zinc-400/40 bg-zinc-400/10 text-zinc-300",
};

export function Bikes({ catalog }: { catalog: BikeCatalog }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return catalog.bikes;
    return catalog.bikes.filter((b) =>
      [b.model_full, b.color, b.use_case, b.groupset, b.id, b.type]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [q, catalog.bikes]);

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHead
          left={
            <span className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-[color:var(--strava-orange)]" />
              Fleet
            </span>
          }
          right={`${catalog.bikes.length} bikes · ${catalog.groupset_default}`}
        />
        <CardBody>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-[12px] text-[color:var(--fg-3)]">
              <span className="text-[color:var(--fg-1)]">{catalog.rider}</span>{" "}
              · {catalog.team_id_owner}. Updated {catalog.updated_at}.
            </div>
            <label className="relative inline-flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-[color:var(--fg-4)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bike or use-case…"
                className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] py-1.5 pl-8 pr-3 text-[12px] text-[color:var(--fg-1)] placeholder:text-[color:var(--fg-5)] focus:border-[color:var(--border-strong)] focus:outline-none md:w-[260px]"
              />
            </label>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((b) => {
          const typeCls = TYPE_COLOR[b.type] ?? TYPE_COLOR.default;
          return (
            <Card key={b.id}>
              <CardHead
                left={
                  <span className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-[color:var(--fg-3)]" />
                    {b.model_full}
                  </span>
                }
                right={
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]",
                      typeCls,
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {b.type.replace(/-/g, " ")}
                  </span>
                }
              />
              <CardBody>
                {b.photo ? (
                  <div className="relative mb-3 h-40 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)]">
                    <Image
                      src={b.photo}
                      alt={`${b.model_full} ${b.color}`}
                      fill
                      sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex h-40 items-center justify-center rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--bg)] text-[10px] uppercase tracking-[0.14em] text-[color:var(--fg-5)]">
                    Drop photo at <code className="ml-1 font-mono">/public/bikes/{b.id}.jpg</code>
                  </div>
                )}
                <div className="space-y-1.5 text-[12px]">
                  <Row label="Color" value={b.color} />
                  <Row label="Frame" value={b.frame_material} />
                  <Row label="Groupset" value={b.groupset} />
                  <Row label="Use" value={b.use_case} />
                </div>
                {b.notes && (
                  <div className="mt-3 border-t border-[color:var(--border-soft)] pt-2 text-[11px] italic text-[color:var(--fg-3)]">
                    {b.notes}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={b.manual_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-2)] hover:border-[color:var(--strava-orange)] hover:text-[color:var(--strava-orange)]"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Manual
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-[12px] text-[color:var(--fg-4)]">
                No bikes match &ldquo;{query}&rdquo;.
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Card>
        <CardHead
          left={
            <span className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[color:var(--fg-3)]" />
              Shared manuals
            </span>
          }
          right={`${catalog.shared_manuals.length} doc${catalog.shared_manuals.length === 1 ? "" : "s"}`}
        />
        <div className="flex flex-col">
          {catalog.shared_manuals.map((m) => (
            <a
              key={m.code}
              href={m.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 border-b border-[color:var(--border-soft)] px-4 py-3 last:border-b-0 hover:bg-[color:var(--bg-row)]"
            >
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--fg-3)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[color:var(--fg-1)]">
                  {m.name}
                  <span className="rounded-sm border border-[color:var(--border)] bg-[color:var(--bg)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--fg-4)]">
                    {m.code}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
                  {m.covers}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--fg-5)]">
                  Applies to {m.applies_to_bikes.length} bike
                  {m.applies_to_bikes.length === 1 ? "" : "s"}
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-[color:var(--fg-4)]" />
            </a>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead
          left={
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[color:var(--fg-3)]" />
              Pairing apps
            </span>
          }
          right={`${catalog.groupset_app_pairings.length}`}
        />
        <div className="flex flex-col">
          {catalog.groupset_app_pairings.map((p) => (
            <div
              key={p.name}
              className="border-b border-[color:var(--border-soft)] px-4 py-3 last:border-b-0"
            >
              <div className="text-[13px] font-bold text-[color:var(--fg-1)]">
                {p.name}
              </div>
              <div className="mt-0.5 text-[11px] text-[color:var(--fg-3)]">
                {p.purpose} · {p.platform}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-[70px] flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--fg-4)]">
        {label}
      </span>
      <span className="text-[color:var(--fg-1)]">{value}</span>
    </div>
  );
}
