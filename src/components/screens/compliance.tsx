import { getRules } from "@/lib/db/queries";
import {
  evaluateRules,
  isNight,
  type RuleContext,
  type RuleEvaluation,
} from "@/lib/raam/rules-engine";
import { Card, CardHead, CardBody } from "@/components/ui/card";
import { Pill, type PillKind } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  time: "Time & RRS",
  night: "Night protocol",
  geo: "Geographic zones",
  safety: "Safety / equipment",
  support: "Support vehicle",
  racer: "Racer conduct",
  penalty: "Penalty & DQ",
  nutrition: "Nutrition",
  sleep: "Sleep & fatigue",
};

const CATEGORY_ORDER = [
  "penalty",
  "sleep",
  "night",
  "time",
  "geo",
  "support",
  "safety",
  "racer",
  "nutrition",
];

const SEV_PILL: Record<string, PillKind> = {
  info: "INFO",
  warn: "WARN",
  critical: "CRITICAL",
};

export async function Compliance() {
  const rules = await getRules();

  // Mock live context — replace with derived state from gps_ping, shifts,
  // nutrition_log, rest_log, penalty tables as those feeds come online.
  const ctx: RuleContext = buildMockContext();
  const night = isNight(ctx);
  const activeEvals = evaluateRules(ctx);
  const evalByCode = new Map(activeEvals.map((e) => [e.code, e]));

  const grouped = new Map<string, typeof rules>();
  for (const r of rules) {
    if (!grouped.has(r.category)) grouped.set(r.category, []);
    grouped.get(r.category)!.push(r);
  }

  const violations = activeEvals.filter(
    (e) => e.status === "violation" || e.status === "triggered",
  );
  const warns = activeEvals.filter((e) => e.status === "warn");

  return (
    <div className="flex flex-col gap-3.5">
      {/* Hero — status snapshot */}
      <div className="grid gap-3.5 md:grid-cols-4">
        <Card>
          <CardBody>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Active violations
            </div>
            <div
              className={cn(
                "mt-2 font-mono text-[34px] font-bold leading-none tabular-nums",
                violations.length > 0 ? "text-red-400" : "text-emerald-400",
              )}
            >
              {violations.length}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[color:var(--fg-4)]">
              {warns.length} warnings in queue
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Penalty ledger
            </div>
            <div className="mt-2 font-mono text-[34px] font-bold leading-none tabular-nums">
              {ctx.penaltyCount}
              <span className="text-[16px] font-medium text-[color:var(--fg-4)]">
                {" / 5"}
              </span>
            </div>
            <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-[color:var(--bg-row)]">
              <span
                className={cn(
                  "block h-full rounded-full",
                  ctx.penaltyCount >= 4
                    ? "bg-red-500"
                    : ctx.penaltyCount >= 2
                      ? "bg-amber-400"
                      : "bg-emerald-400",
                )}
                style={{ width: `${(ctx.penaltyCount / 5) * 100}%` }}
              />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Mode
            </div>
            <div
              className={cn(
                "mt-2 font-mono text-[28px] font-bold leading-none",
                night ? "text-indigo-400" : "text-amber-400",
              )}
            >
              {night ? "NIGHT" : "DAY"}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[color:var(--fg-4)]">
              local {String(ctx.localHour).padStart(2, "0")}:00 · {ctx.state}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
              Rule catalog
            </div>
            <div className="mt-2 font-mono text-[34px] font-bold leading-none tabular-nums">
              {rules.length}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[color:var(--fg-4)]">
              {rules.filter((r) => r.dq_trigger).length} DQ triggers
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Live evaluations */}
      {activeEvals.length > 0 && (
        <Card>
          <CardHead
            left={`Live evaluations · ${activeEvals.length}`}
            right={<span className="font-mono">engine tick</span>}
          />
          <div className="flex flex-col">
            {activeEvals.map((e) => (
              <EvalRow key={e.code} e={e} />
            ))}
          </div>
        </Card>
      )}

      {/* Rule catalog by category */}
      {CATEGORY_ORDER.map((cat) => {
        const catRules = grouped.get(cat);
        if (!catRules || catRules.length === 0) return null;
        return (
          <Card key={cat}>
            <CardHead
              left={`${CATEGORY_LABEL[cat] ?? cat} · ${catRules.length}`}
              right={
                <span className="font-mono text-[color:var(--fg-4)]">
                  {catRules.filter((r) => r.dq_trigger).length} DQ
                </span>
              }
            />
            <div className="flex flex-col">
              {catRules.map((r) => {
                const ev = evalByCode.get(r.code);
                const status = ev?.status ?? "ok";
                return <RuleRow key={r.code} rule={r} ev={ev} status={status} />;
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function EvalRow({ e }: { e: RuleEvaluation }) {
  const bg =
    e.status === "triggered" || e.status === "violation"
      ? "bg-red-500/10"
      : e.status === "warn"
        ? "bg-amber-400/10"
        : "";
  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-[color:var(--border-soft)] px-4 py-3 last:border-b-0",
        bg,
      )}
    >
      <Pill kind={SEV_PILL[e.severity] ?? "INFO"} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-[color:var(--fg-1)]">
          {e.title}
        </div>
        {e.detail && (
          <div className="mt-1 text-[11px] text-[color:var(--fg-3)]">
            {e.detail}
          </div>
        )}
        <div className="mt-1 font-mono text-[10px] text-[color:var(--fg-5)]">
          {e.code}
        </div>
      </div>
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] font-semibold text-[color:var(--fg-3)]"
      >
        ACK
      </button>
    </div>
  );
}

function RuleRow({
  rule,
  ev,
  status,
}: {
  rule: Awaited<ReturnType<typeof getRules>>[number];
  ev: RuleEvaluation | undefined;
  status: "ok" | "warn" | "violation" | "triggered";
}) {
  const dot =
    status === "triggered" || status === "violation"
      ? "bg-red-500"
      : status === "warn"
        ? "bg-amber-400"
        : "bg-emerald-500";
  return (
    <div className="flex items-start gap-3 border-b border-[color:var(--border-soft)] px-4 py-2.5 last:border-b-0">
      <span className={cn("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", dot)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-[color:var(--fg-1)]">
            {rule.name}
          </span>
          {rule.dq_trigger && <Pill kind="CRITICAL">DQ TRIGGER</Pill>}
          {rule.source_ref && (
            <span className="font-mono text-[10px] text-[color:var(--fg-5)]">
              {rule.source_ref}
            </span>
          )}
        </div>
        <div className="mt-1 text-[11px] leading-relaxed text-[color:var(--fg-3)]">
          {rule.description}
        </div>
        {ev && (
          <div className="mt-1 font-mono text-[10px] text-red-400">
            live: {ev.title}
          </div>
        )}
      </div>
      <span className="font-mono text-[10px] text-[color:var(--fg-5)]">
        {rule.code}
      </span>
    </div>
  );
}

function buildMockContext(): RuleContext {
  // Seeds plausible mid-race state. Wire real telemetry as it comes online.
  const now = new Date();
  return {
    nowUtc: now,
    localHour: 1,
    visibilityFt: null,
    currentSpeed: 9.6,
    recentSpeedsMph: [8.6, 8.2, 8.4, 8.8, 9.1, 9.4, 10.1, 11.2, 12.3, 12.8, 13.0, 13.5],
    currentMile: 781.4,
    state: "CO",
    lastGpsPingIso: new Date(now.getTime() - 42 * 60_000).toISOString(),
    lastTsArrivalIso: new Date(now.getTime() - 24 * 60_000).toISOString(),
    rrsCheckedIn: false,
    penaltyCount: 1,
    awakeHours: 22,
    recoveryPct: 52,
    followDistanceFt: 41,
  };
}
