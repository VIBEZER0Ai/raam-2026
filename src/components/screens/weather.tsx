"use client";

import { Card, CardBody, CardHead } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import {
  formatDistance,
  formatTempC,
  speedUnit,
  type UnitsPref,
} from "@/lib/units";
import {
  compassLabel,
  type WeatherForecast,
  type WindClassification,
} from "@/lib/raam/weather";
import { cn } from "@/lib/utils";

export interface WeatherSegmentProps {
  fromLabel: string;
  toLabel: string;
  miles: number;
  /** Initial bearing in deg (0=N) along the segment. */
  route_bearing: number;
  /** Open-Meteo data fetched for the destination TS. Null on fetch failure. */
  weather: WeatherForecast | null;
  /** Headwind/tailwind classification for the rider on this segment. */
  classification: WindClassification | null;
}

export interface WeatherProps {
  units: UnitsPref;
  /** Where the "now" card refers to (e.g. "TS14 (rider)"). */
  anchorLabel: string;
  /** Open-Meteo at rider position. Null on fetch failure. */
  now: WeatherForecast | null;
  segments: WeatherSegmentProps[];
}

export function Weather({ units, anchorLabel, now, segments }: WeatherProps) {
  // Total wind component across upcoming segments — sum tail boost / head drag.
  const totalWindComponent = segments.reduce(
    (a, s) => a + (s.classification?.componentKph ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid gap-3.5 md:grid-cols-[1fr_1fr_1fr]">
        <Card>
          <CardHead left="Now · rider position" right={anchorLabel} />
          <CardBody className="grid grid-cols-2 gap-3">
            {now ? (
              <>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                    Temp
                  </div>
                  <div className="mt-1 font-mono text-[36px] font-bold tabular-nums">
                    {formatTempC(now.now.tempC, units)}
                  </div>
                  {now.now.apparentC !== undefined && (
                    <div className="font-mono text-[11px] text-[color:var(--fg-4)]">
                      feels {formatTempC(now.now.apparentC, units)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
                    Wind
                  </div>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-mono text-[36px] font-bold tabular-nums text-amber-400">
                      {Math.round(
                        units === "metric"
                          ? now.now.windKph
                          : now.now.windKph * 0.621371,
                      )}
                    </span>
                    <span className="pb-2 font-mono text-[12px] text-[color:var(--fg-4)]">
                      {speedUnit(units)} {compassLabel(now.now.windDirDeg)}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[color:var(--fg-4)]">
                    precip {now.now.precipMm.toFixed(1)} mm
                  </div>
                </div>
              </>
            ) : (
              <FetchFailedNote />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHead left="Conditions" right={now ? "Open-Meteo · 15 min cache" : "—"} />
          <CardBody>
            {now ? (
              <div className="grid grid-cols-2 gap-3 font-mono text-[12px]">
                <InfoPair label="Coord" value={`${now.lat.toFixed(3)}, ${now.lon.toFixed(3)}`} />
                <InfoPair
                  label="Wind from"
                  value={`${Math.round(now.now.windDirDeg)}° ${compassLabel(now.now.windDirDeg)}`}
                />
                <InfoPair
                  label="Precip"
                  value={`${now.now.precipMm.toFixed(1)} mm`}
                />
                <InfoPair
                  label="Fetched"
                  value={new Date(now.fetchedAt).toLocaleTimeString()}
                />
              </div>
            ) : (
              <FetchFailedNote />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHead
            left={`Wind component · next ${segments.length}`}
            right={
              <span
                className={cn(
                  "font-mono",
                  totalWindComponent < -5
                    ? "text-red-400"
                    : totalWindComponent > 5
                    ? "text-emerald-400"
                    : "text-[color:var(--fg-3)]",
                )}
              >
                {totalWindComponent > 0 ? "+" : ""}
                {(units === "metric"
                  ? totalWindComponent
                  : totalWindComponent * 0.621371
                ).toFixed(1)}{" "}
                {speedUnit(units)}
              </span>
            }
          />
          <CardBody>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Wind speed across segments
            </div>
            <Sparkline
              points={segments.map((s) => s.weather?.now.windKph ?? 0)}
              color="var(--amber-400)"
            />
            <div className="mt-2 text-[11px] text-[color:var(--fg-4)]">
              + = tailwind boost · − = headwind drag
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHead
          left="Segment forecast"
          right={`${segments.length} TS · scroll →`}
        />
        <div className="flex gap-3 overflow-x-auto p-3">
          {segments.length === 0 && (
            <div className="text-[12px] text-[color:var(--fg-4)]">
              No upcoming time stations to forecast.
            </div>
          )}
          {segments.map((s) => (
            <SegmentCard key={`${s.fromLabel}-${s.toLabel}`} seg={s} units={units} />
          ))}
        </div>
      </Card>

      <Card>
        <CardHead left="Crew weather actions" right="auto-triggered (P2)" />
        <div className="flex flex-col">
          {segments
            .map((s) => weatherAction(s, units))
            .filter((a): a is WeatherAction => a !== null)
            .slice(0, 6)
            .map((a, i) => (
              <ActionRow
                key={i}
                when={a.when}
                label={a.label}
                action={a.action}
                severity={a.severity}
              />
            ))}
          {segments.every((s) => weatherAction(s, units) === null) && (
            <div className="px-4 py-3 text-[12px] text-[color:var(--fg-4)]">
              No weather alerts on the next {segments.length} segments.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function SegmentCard({
  seg,
  units,
}: {
  seg: WeatherSegmentProps;
  units: UnitsPref;
}) {
  const cls = seg.classification;
  const wx = seg.weather;
  const bad = cls && cls.componentKph < -8;
  const good = cls && cls.componentKph > 5;
  return (
    <div
      className={cn(
        "flex min-w-[230px] flex-col gap-2 rounded-[10px] border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)] p-3",
        bad && "border-red-900/60",
        good && "border-emerald-900/60",
      )}
    >
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
        <span>{seg.fromLabel}</span>
        <span className="font-mono text-[10px] text-[color:var(--fg-4)]">
          {formatDistance(seg.miles, units, 1)}
        </span>
      </div>
      <div className="text-[13px] font-semibold text-[color:var(--fg-1)]">
        → {seg.toLabel}
      </div>
      {wx ? (
        <>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[20px] font-bold tabular-nums text-amber-400">
              {Math.round(
                units === "metric" ? wx.now.windKph : wx.now.windKph * 0.621371,
              )}
            </span>
            <span className="font-mono text-[11px] text-[color:var(--fg-4)]">
              {speedUnit(units)} {compassLabel(wx.now.windDirDeg)}
            </span>
          </div>
          <div className="font-mono text-[11px] text-[color:var(--fg-3)]">
            {formatTempC(wx.now.tempC, units)} · precip {wx.now.precipMm.toFixed(1)} mm
          </div>
          {cls && (
            <div
              className={cn(
                "font-mono text-[12px] font-bold",
                cls.relation === "headwind" && "text-red-400",
                cls.relation === "tailwind" && "text-emerald-400",
                (cls.relation === "crosswind-l" || cls.relation === "crosswind-r") &&
                  "text-amber-400",
              )}
            >
              {cls.relation} ·{" "}
              {(units === "metric"
                ? cls.componentKph
                : cls.componentKph * 0.621371
              ).toFixed(1)}{" "}
              {speedUnit(units)}
            </div>
          )}
        </>
      ) : (
        <div className="text-[11px] text-[color:var(--fg-4)]">
          Forecast unavailable.
        </div>
      )}
    </div>
  );
}

interface WeatherAction {
  when: string;
  label: string;
  action: string;
  severity: "WARN" | "INFO" | "AMBER";
}

function weatherAction(
  seg: WeatherSegmentProps,
  units: UnitsPref,
): WeatherAction | null {
  const wx = seg.weather;
  const cls = seg.classification;
  if (!wx || !cls) return null;
  // Headwind > 15 km/h component
  if (cls.componentKph < -15) {
    return {
      when: seg.toLabel,
      label: `Headwind ${Math.abs(
        units === "metric" ? cls.componentKph : cls.componentKph * 0.621371,
      ).toFixed(0)} ${speedUnit(units)}`,
      action: "Aero tuck · reduce effort 5% · pre-cool if hot",
      severity: "WARN",
    };
  }
  // Hot: > 35°C
  if (wx.now.tempC > 35) {
    return {
      when: seg.toLabel,
      label: `${formatTempC(wx.now.tempC, units)} forecast`,
      action: "Pre-cool 20 min · ice socks · 800 mg/L sodium target",
      severity: "AMBER",
    };
  }
  // Cold: < 7°C
  if (wx.now.tempC < 7) {
    return {
      when: seg.toLabel,
      label: `Temp drops to ${formatTempC(wx.now.tempC, units)}`,
      action: "Stage warm layers in follow vehicle · long-sleeve base",
      severity: "INFO",
    };
  }
  // Precip > 2mm
  if (wx.now.precipMm > 2) {
    return {
      when: seg.toLabel,
      label: `Precipitation ${wx.now.precipMm.toFixed(1)} mm`,
      action: "Rain shell ready · check tire grip · low-light on",
      severity: "WARN",
    };
  }
  return null;
}

function FetchFailedNote() {
  return (
    <div className="col-span-2 text-[12px] text-[color:var(--fg-4)]">
      Open-Meteo unreachable. Will retry on next 15-min revalidate.
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
