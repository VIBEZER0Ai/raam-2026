/**
 * Rule runner — evaluates engine, dedupes vs recent `rule_evaluation`
 * rows, persists new firings, and posts critical/warn alerts to Discord.
 *
 * Called from:
 *   - /api/gps/ping POST (after insert)
 *   - rest actions (startSleep, endSleep) — sleep state change
 *   - manual button on /compliance
 *   - (future) Vercel cron every 5 min
 *
 * Dedup window: 15 min per (rule_code, severity).
 * If the same rule re-fires at a higher severity within the window,
 * a new row is still created (warn → critical counts as escalation).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  evaluateRules,
  type RuleContext,
  type RuleEvaluation,
} from "@/lib/raam/rules-engine";
import { sendDiscordMessage } from "@/lib/raam/discord";
import {
  getAwakeStatus,
  getDerivedRaceState,
  getPenaltyLedger,
} from "@/lib/db/queries";

const DEDUP_WINDOW_MS = 15 * 60_000;

export interface RunnerSummary {
  evaluated: number;
  persisted: number;
  dedup_skipped: number;
  discord_sent: number;
  discord_skipped: number;
  discord_failed: number;
  fired: Array<{
    code: string;
    severity: string;
    status: string;
    title: string;
  }>;
}

/**
 * Build a real-ish RuleContext from current DB state.
 * Mirrors the logic in /compliance but usable from API/action contexts.
 */
async function buildContext(): Promise<RuleContext> {
  const [awake, derived, ledger] = await Promise.all([
    getAwakeStatus(),
    getDerivedRaceState(),
    getPenaltyLedger(),
  ]);
  const now = new Date();
  return {
    nowUtc: now,
    localHour: now.getHours(),
    visibilityFt: null,
    currentSpeed: derived.currentSpeed,
    recentSpeedsMph: derived.recentSpeedsMph,
    currentMile: derived.currentMile,
    state: derived.state,
    lastGpsPingIso: derived.lastGpsPingIso,
    lastTsArrivalIso: null,
    rrsCheckedIn: true,
    penaltyCount: ledger.dq_risk_count,
    awakeHours: awake.awakeHours,
    recoveryPct: awake.recoveryPct,
    followDistanceFt: null,
  };
}

export async function runRuleEngine(): Promise<RunnerSummary> {
  const ctx = await buildContext();
  const evaluations = evaluateRules(ctx);

  const summary: RunnerSummary = {
    evaluated: evaluations.length,
    persisted: 0,
    dedup_skipped: 0,
    discord_sent: 0,
    discord_skipped: 0,
    discord_failed: 0,
    fired: [],
  };

  if (evaluations.length === 0) return summary;

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();

  for (const ev of evaluations) {
    // Dedup: same code, status, fired in last 15 min, not resolved
    const { data: recent } = await admin
      .from("rule_evaluation")
      .select("id,status")
      .eq("rule_code", ev.code)
      .gt("fired_at", cutoff)
      .neq("status", "resolved")
      .limit(1)
      .maybeSingle();

    if (recent) {
      summary.dedup_skipped += 1;
      continue;
    }

    // Persist new firing
    const { error: insertErr } = await admin.from("rule_evaluation").insert({
      rule_code: ev.code,
      fired_at: new Date().toISOString(),
      context: {
        severity: ev.severity,
        status: ev.status,
        title: ev.title,
        detail: ev.detail ?? null,
        ...(ev.context ?? {}),
      },
      status: "open",
    });
    if (insertErr) {
      console.warn("[rule-runner insert]", insertErr);
      continue;
    }
    summary.persisted += 1;
    summary.fired.push({
      code: ev.code,
      severity: ev.severity,
      status: ev.status,
      title: ev.title,
    });

    // Discord — only post critical + triggered + violation
    const shouldPost =
      ev.severity === "critical" ||
      ev.status === "triggered" ||
      ev.status === "violation";
    if (!shouldPost) {
      summary.discord_skipped += 1;
      continue;
    }
    if (!process.env.DISCORD_WEBHOOK_URL) {
      summary.discord_skipped += 1;
      continue;
    }
    const res = await sendDiscordMessage({
      kind: ev.severity === "critical" ? "alert" : "info",
      title: ev.title,
      body: [
        ev.detail ?? "",
        `Rule: ${ev.code} · Severity: ${ev.severity}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    if (res.ok) summary.discord_sent += 1;
    else summary.discord_failed += 1;
  }

  return summary;
}
