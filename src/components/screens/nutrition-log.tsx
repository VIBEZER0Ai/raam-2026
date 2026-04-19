"use client";

import { useState } from "react";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { ProgressRow } from "@/components/ui/progress-row";
import { QuickLogButton } from "@/components/ui/quick-log-button";
import { NUTRITION_LOG } from "@/lib/raam/mock-data";
import { cn } from "@/lib/utils";

export function NutritionLog() {
  const [toast, setToast] = useState<string | null>(null);
  const fire = (label: string) => {
    setToast(`Logged ${label}`);
    setTimeout(() => setToast(null), 2000);
  };

  const total = NUTRITION_LOG.reduce(
    (acc, e) => ({
      c: acc.c + e.c,
      w: acc.w + e.w,
      s: acc.s + e.s,
    }),
    { c: 0, w: 0, s: 0 },
  );

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHead left="Quick log — tap to record" right="last 3h rolling" />
        <CardBody>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            <QuickLogButton value="30" unit="g carb" onClick={() => fire("30g carb")} />
            <QuickLogButton value="60" unit="g carb" onClick={() => fire("60g carb")} />
            <QuickLogButton value="90" unit="g carb" onClick={() => fire("90g carb")} />
            <QuickLogButton value="250" unit="ml water" onClick={() => fire("250ml water")} />
            <QuickLogButton value="500" unit="ml water" onClick={() => fire("500ml water")} />
            <QuickLogButton value="750" unit="ml water" onClick={() => fire("750ml water")} />
            <QuickLogButton value="200" unit="mg Na" onClick={() => fire("200mg Na")} />
            <QuickLogButton value="400" unit="mg Na" onClick={() => fire("400mg Na")} />
            <QuickLogButton value="100" unit="mg caff" onClick={() => fire("100mg caffeine")} />
            <QuickLogButton value="Gel" unit="60g gel" onClick={() => fire("Gel")} />
            <QuickLogButton value="Real food" unit="log" onClick={() => fire("Real food")} />
            <QuickLogButton value="+" unit="custom" onClick={() => fire("custom")} />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-3.5 md:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHead left="Hourly targets · last 1h" right="phase: Rockies 400-450 kcal/hr" />
          <CardBody>
            <ProgressRow label="Carbs" value={70} max={90} unit="g" color="#34d399" />
            <ProgressRow label="Water" value={465} max={750} unit="ml" color="#fbbf24" />
            <ProgressRow label="Sodium" value={440} max={1000} unit="mg" color="#f87171" />
            <ProgressRow label="Caffeine" value={80} max={200} unit="mg" color="#818cf8" />

            <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-[rgba(154,52,18,0.6)] bg-orange-400/10 px-3 py-2 text-orange-200">
              <span className="rounded-sm bg-orange-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1c1917]">
                FEED
              </span>
              <span className="text-[12px] font-semibold">
                Prep 60g + 500ml at mi 795
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-[10px] border border-[rgba(120,53,15,0.6)] bg-amber-400/10 px-3 py-2 text-amber-200">
              <span className="rounded-sm bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1c1917]">
                SODIUM
              </span>
              <span className="text-[12px] font-semibold">
                Deficit 60mg · night window approaching, up to 800mg/L
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead left="Rolling 3h" right={`${NUTRITION_LOG.length} entries`} />
          <CardBody className="grid grid-cols-3 gap-2">
            <TotalCell label="Carbs" value={`${total.c}g`} />
            <TotalCell label="Water" value={`${total.w}ml`} />
            <TotalCell label="Sodium" value={`${total.s}mg`} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHead left="Entries" right="newest first" />
        <div className="flex flex-col">
          {NUTRITION_LOG.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-[color:var(--border-soft)] px-4 py-2.5 text-[13px] last:border-b-0"
            >
              <span className="w-12 font-mono text-[11px] tabular-nums text-[color:var(--fg-4)]">
                {e.t}
              </span>
              <span className="flex-1 text-[color:var(--fg-1)]">{e.what}</span>
              <div className="hidden gap-4 font-mono text-[11px] tabular-nums text-[color:var(--fg-3)] md:flex">
                {e.c > 0 && <span>{e.c}g</span>}
                {e.w > 0 && <span>{e.w}ml</span>}
                {e.s > 0 && <span>{e.s}mg</span>}
              </div>
              <Pill kind="OFF">{e.who}</Pill>
            </div>
          ))}
        </div>
      </Card>

      {toast && (
        <div
          className={cn(
            "fixed left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-emerald-400 px-4 py-2.5 text-[13px] font-bold text-[#03190e] shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
            "bottom-24",
          )}
          style={{ animation: "toast-in 0.25s ease-out" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function TotalCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
        {label}
      </div>
      <div className="mt-1 font-mono text-[22px] font-bold tabular-nums">
        {value}
      </div>
    </div>
  );
}
