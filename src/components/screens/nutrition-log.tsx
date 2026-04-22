"use client";

import { useState, useTransition } from "react";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { ProgressRow } from "@/components/ui/progress-row";
import { QuickLogButton } from "@/components/ui/quick-log-button";
import { logNutrition } from "@/app/actions/nutrition";
import type { DbNutritionLog, NutritionRollup } from "@/lib/db/queries";
import { fmtPingAge } from "@/lib/raam/format";
import { cn } from "@/lib/utils";

export interface NutritionLogProps {
  entries: DbNutritionLog[];
  rollup: NutritionRollup;
}

const CARBS_TARGET = 90;
const WATER_TARGET = 750;
const SODIUM_TARGET = 1000;
const CAFFEINE_TARGET = 200;

export function NutritionLog({ entries, rollup }: NutritionLogProps) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const fire = (payload: Parameters<typeof logNutrition>[0], label: string) =>
    startTransition(async () => {
      const res = await logNutrition(payload);
      if (res.ok) {
        setToast(`Logged ${label}`);
        setTimeout(() => setToast(null), 1800);
      } else {
        setToast(`Error: ${res.error}`);
        setTimeout(() => setToast(null), 3000);
      }
    });

  const h = rollup.hourly;

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHead
          left="Quick log — tap to record"
          right={
            <span className="font-mono">
              last 1h: {h.carbs_g.toFixed(0)}g · {h.water_ml.toFixed(0)}ml ·{" "}
              {h.sodium_mg.toFixed(0)}mg Na
            </span>
          }
        />
        <CardBody>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            <QuickLogButton
              value="30"
              unit="g carb"
              onClick={() => fire({ carbs_g: 30 }, "30g carb")}
            />
            <QuickLogButton
              value="60"
              unit="g carb"
              onClick={() => fire({ carbs_g: 60 }, "60g carb")}
            />
            <QuickLogButton
              value="90"
              unit="g carb"
              onClick={() => fire({ carbs_g: 90 }, "90g carb")}
            />
            <QuickLogButton
              value="250"
              unit="ml water"
              onClick={() => fire({ water_ml: 250 }, "250ml water")}
            />
            <QuickLogButton
              value="500"
              unit="ml water"
              onClick={() => fire({ water_ml: 500 }, "500ml water")}
            />
            <QuickLogButton
              value="750"
              unit="ml water"
              onClick={() => fire({ water_ml: 750 }, "750ml water")}
            />
            <QuickLogButton
              value="200"
              unit="mg Na"
              onClick={() => fire({ sodium_mg: 200 }, "200mg Na")}
            />
            <QuickLogButton
              value="400"
              unit="mg Na"
              onClick={() => fire({ sodium_mg: 400 }, "400mg Na")}
            />
            <QuickLogButton
              value="100"
              unit="mg caff"
              onClick={() => fire({ caffeine_mg: 100 }, "100mg caff")}
            />
            <QuickLogButton
              value="Gel"
              unit="60g gel"
              onClick={() =>
                fire({ carbs_g: 60, notes: "Gel" }, "60g gel")
              }
            />
            <QuickLogButton
              value="Real food"
              unit="log"
              onClick={() =>
                fire(
                  { carbs_g: 40, calories_kcal: 250, notes: "Real food" },
                  "real food",
                )
              }
            />
            <QuickLogButton
              value="+"
              unit="custom"
              onClick={() =>
                fire({ notes: "Custom entry — edit via Supabase" }, "custom")
              }
            />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-3.5 md:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHead
            left="Hourly targets · last 1h"
            right={
              <span className="font-mono">
                phase: Rockies 400-450 kcal/hr
              </span>
            }
          />
          <CardBody>
            <ProgressRow
              label="Carbs"
              value={Math.round(h.carbs_g)}
              max={CARBS_TARGET}
              unit="g"
              color="#34d399"
            />
            <ProgressRow
              label="Water"
              value={Math.round(h.water_ml)}
              max={WATER_TARGET}
              unit="ml"
              color="#fbbf24"
            />
            <ProgressRow
              label="Sodium"
              value={Math.round(h.sodium_mg)}
              max={SODIUM_TARGET}
              unit="mg"
              color="#f87171"
            />
            <ProgressRow
              label="Caffeine"
              value={Math.round(h.caffeine_mg)}
              max={CAFFEINE_TARGET}
              unit="mg"
              color="#818cf8"
            />

            {h.carbs_g < 42 && (
              <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-[rgba(154,52,18,0.6)] bg-orange-400/10 px-3 py-2 text-orange-200">
                <span className="rounded-sm bg-orange-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1c1917]">
                  FEED
                </span>
                <span className="text-[12px] font-semibold">
                  Carbs {h.carbs_g.toFixed(0)}g last hour — below 42g/hr floor
                </span>
              </div>
            )}
            {h.sodium_mg < 400 && h.carbs_g > 0 && (
              <div className="mt-2 flex items-center gap-2 rounded-[10px] border border-[rgba(120,53,15,0.6)] bg-amber-400/10 px-3 py-2 text-amber-200">
                <span className="rounded-sm bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1c1917]">
                  SODIUM
                </span>
                <span className="text-[12px] font-semibold">
                  Deficit {400 - Math.round(h.sodium_mg)}mg below hourly min
                </span>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHead
            left="Rolling 3h"
            right={
              <span className="font-mono">
                {rollup.three_hour.entry_count} entries
              </span>
            }
          />
          <CardBody className="grid grid-cols-3 gap-2">
            <TotalCell
              label="Carbs"
              value={`${Math.round(rollup.three_hour.carbs_g)}g`}
            />
            <TotalCell
              label="Water"
              value={`${Math.round(rollup.three_hour.water_ml)}ml`}
            />
            <TotalCell
              label="Sodium"
              value={`${Math.round(rollup.three_hour.sodium_mg)}mg`}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHead
          left={`Entries · last 30`}
          right={<span className="font-mono">newest first</span>}
        />
        <div className="flex flex-col">
          {entries.length === 0 && (
            <div className="px-4 py-8 text-center text-[12px] text-[color:var(--fg-4)]">
              Nothing logged yet. Tap a quick-log button above to record.
            </div>
          )}
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 border-b border-[color:var(--border-soft)] px-4 py-2.5 text-[13px] last:border-b-0"
            >
              <span className="w-16 font-mono text-[11px] tabular-nums text-[color:var(--fg-4)]">
                {fmtPingAge(e.logged_at)}
              </span>
              <span className="flex-1 text-[color:var(--fg-1)]">
                {labelFor(e)}
              </span>
              <div className="hidden gap-4 font-mono text-[11px] tabular-nums text-[color:var(--fg-3)] md:flex">
                {Number(e.carbs_g ?? 0) > 0 && <span>{e.carbs_g}g</span>}
                {Number(e.water_ml ?? 0) > 0 && <span>{e.water_ml}ml</span>}
                {Number(e.sodium_mg ?? 0) > 0 && <span>{e.sodium_mg}mg Na</span>}
                {Number(e.caffeine_mg ?? 0) > 0 && (
                  <span>{e.caffeine_mg}mg caff</span>
                )}
                {Number(e.calories_kcal ?? 0) > 0 && (
                  <span>{e.calories_kcal} kcal</span>
                )}
              </div>
              <Pill kind="OFF">{e.logged_by ? "crew" : "—"}</Pill>
            </div>
          ))}
        </div>
      </Card>

      {toast && (
        <div
          className={cn(
            "fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-lg px-4 py-2.5 text-[13px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
            toast.startsWith("Error")
              ? "bg-red-500 text-white"
              : "bg-emerald-400 text-[#03190e]",
            pending && "opacity-70",
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

function labelFor(e: DbNutritionLog): string {
  if (e.notes && e.notes.trim()) return e.notes;
  const parts: string[] = [];
  if (Number(e.carbs_g ?? 0) > 0) parts.push(`${e.carbs_g}g carb`);
  if (Number(e.water_ml ?? 0) > 0) parts.push(`${e.water_ml}ml water`);
  if (Number(e.sodium_mg ?? 0) > 0) parts.push(`${e.sodium_mg}mg Na`);
  if (Number(e.caffeine_mg ?? 0) > 0)
    parts.push(`${e.caffeine_mg}mg caffeine`);
  if (Number(e.calories_kcal ?? 0) > 0)
    parts.push(`${e.calories_kcal} kcal`);
  return parts.join(" + ") || "Entry";
}
