"use client";

import { Card, CardBody, CardHead } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import { WEATHER_NOW, WEATHER_SEGMENTS } from "@/lib/raam/mock-data";
import { cn } from "@/lib/utils";

export function Weather() {
  const totalImpact = WEATHER_SEGMENTS.reduce((a, s) => a + s.impact, 0);
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid gap-3.5 md:grid-cols-[1fr_1fr_1fr]">
        <Card>
          <CardHead left="Now · rider position" right="TS14 Cortez" />
          <CardBody className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                Temp
              </div>
              <div className="mt-1 font-mono text-[36px] font-bold tabular-nums">
                {WEATHER_NOW.temp}°F
              </div>
              <div className="font-mono text-[11px] text-[color:var(--fg-4)]">
                feels {WEATHER_NOW.feels}°F
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                Wind
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-mono text-[36px] font-bold tabular-nums text-amber-400">
                  {WEATHER_NOW.wind}
                </span>
                <span className="pb-2 font-mono text-[12px] text-[color:var(--fg-4)]">
                  mph {WEATHER_NOW.windDir}
                </span>
              </div>
              <div className="font-mono text-[11px] text-red-400">
                headwind · −1.8 mph pace
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead left="Conditions" right={WEATHER_NOW.cond} />
          <CardBody>
            <div className="grid grid-cols-2 gap-3 font-mono text-[12px]">
              <InfoPair label="Visibility" value={WEATHER_NOW.visibility} />
              <InfoPair label="Precip" value={`${WEATHER_NOW.precip} in`} />
              <InfoPair label="Humidity" value="24%" />
              <InfoPair label="Pressure" value="1014 mb" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead
            left="Pace impact · next 8 segments"
            right={
              <span
                className={cn(
                  "font-mono",
                  totalImpact < 0 ? "text-red-400" : "text-emerald-400",
                )}
              >
                {totalImpact > 0 ? "+" : ""}
                {totalImpact.toFixed(1)} mph
              </span>
            }
          />
          <CardBody>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Segment wind profile
            </div>
            <Sparkline
              points={WEATHER_SEGMENTS.map((s) => s.wind)}
              color="var(--amber-400)"
            />
            <div className="mt-2 text-[11px] text-[color:var(--fg-4)]">
              Highest: {Math.max(...WEATHER_SEGMENTS.map((s) => s.wind))} mph ·
              Lowest: {Math.min(...WEATHER_SEGMENTS.map((s) => s.wind))} mph
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHead left="Segment forecast" right="scroll right →" />
        <div className="flex gap-3 overflow-x-auto p-3">
          {WEATHER_SEGMENTS.map((s) => {
            const bad = s.impact < -1;
            const good = s.impact > 0;
            return (
              <div
                key={s.from + s.to}
                className={cn(
                  "flex min-w-[220px] flex-col gap-2 rounded-[10px] border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)] p-3",
                  bad && "border-red-900/50",
                  good && "border-emerald-900/50",
                )}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
                  <span>{s.from.replace(/^TS\d+ /, "TS")}</span>
                  <span className="font-mono text-[10px] text-[color:var(--fg-4)]">
                    {s.when}
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-[color:var(--fg-1)]">
                  → {s.to}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[20px] font-bold tabular-nums text-amber-400">
                    {s.wind}
                  </span>
                  <span className="font-mono text-[11px] text-[color:var(--fg-4)]">
                    mph {s.dir}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[color:var(--fg-3)]">
                  {s.temp} · {s.miles.toFixed(1)} mi
                </div>
                <div
                  className={cn(
                    "font-mono text-[12px] font-bold",
                    bad ? "text-red-400" : good ? "text-emerald-400" : "text-[color:var(--fg-3)]",
                  )}
                >
                  {s.impact > 0 ? "+" : ""}
                  {s.impact.toFixed(1)} mph pace
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHead left="Crew weather actions" right="auto-triggered" />
        <div className="flex flex-col">
          <ActionRow
            when="Next 30 min"
            label="Headwind 22 mph ahead"
            action="Switch to aero tuck · pre-cool vest · reduce effort 5%"
            severity="WARN"
          />
          <ActionRow
            when="TS17 South Fork"
            label="Temp drops to 56°F overnight"
            action="Stage warm layers in follow vehicle · long-sleeve base"
            severity="INFO"
          />
          <ActionRow
            when="TS19 La Veta"
            label="Wind 24 mph N · crosswind"
            action="Follow vehicle closer · block wind on exposed stretch"
            severity="WARN"
          />
          <ActionRow
            when="Tomorrow 14:00"
            label="Salome AZ temp 104°F forecast"
            action="Pre-cool 20 min · ice socks · 800mg/L sodium target"
            severity="AMBER"
          />
        </div>
      </Card>
    </div>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[color:var(--fg-5)]">{label}</div>
      <div className="mt-0.5 text-[color:var(--fg-1)]">{value}</div>
    </div>
  );
}

function ActionRow({
  when,
  label,
  action,
  severity,
}: {
  when: string;
  label: string;
  action: string;
  severity: "WARN" | "INFO" | "AMBER";
}) {
  const pill = {
    WARN:  "bg-orange-400 text-[#1c1917]",
    INFO:  "bg-indigo-400 text-[#0b0820]",
    AMBER: "bg-amber-400 text-[#1c1917]",
  }[severity];
  return (
    <div className="flex items-start gap-3 border-b border-[color:var(--border-soft)] px-4 py-3 last:border-b-0">
      <span
        className={cn(
          "mt-0.5 rounded-sm px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em]",
          pill,
        )}
      >
        {severity}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[color:var(--fg-1)]">
          <span>{label}</span>
          <span className="font-mono text-[11px] text-[color:var(--fg-4)]">
            · {when}
          </span>
        </div>
        <div className="mt-0.5 text-[12px] text-[color:var(--fg-3)]">{action}</div>
      </div>
    </div>
  );
}
