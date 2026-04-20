/**
 * RAAM 2026 Rule Compliance Engine
 *
 * Each rule is a pure function (ctx) → evaluation | null.
 * Engine runs all rules against a RuleContext, returns active violations.
 *
 * Rule catalog is persisted in Supabase `rule` table (see 0005 + 0006).
 * This module mirrors a subset whose triggers are evaluable from available telemetry.
 */

export type RuleStatus = "ok" | "warn" | "violation" | "triggered";
export type RuleSeverity = "info" | "warn" | "critical";

export interface RuleContext {
  /** UTC now. Default: Date.now() */
  nowUtc: Date;
  /** Local time hour (0-23) at rider's current position. Used for night detection. */
  localHour: number;
  /** Visibility in feet. null = unknown (assume daylight). */
  visibilityFt: number | null;
  /** Current speed in mph. 0 = stopped. */
  currentSpeed: number;
  /** Last N speed readings (most recent first), 1 per minute. Used for rolling averages. */
  recentSpeedsMph: number[];
  /** Current mile from start (0 → 3068). */
  currentMile: number;
  /** Current state code (CA/AZ/UT/CO/KS/MO/IL/IN/OH/WV/MD/PA/NJ). */
  state: string;
  /** Last GPS tracker ping ISO timestamp. null = never. */
  lastGpsPingIso: string | null;
  /** Last TS arrival timestamp (for RRS 30-min window). null = not arrived. */
  lastTsArrivalIso: string | null;
  /** Whether RRS check-in recorded for last TS arrival. */
  rrsCheckedIn: boolean;
  /** Penalty count so far. */
  penaltyCount: number;
  /** Awake hours since last sleep. */
  awakeHours: number;
  /** Whoop recovery % (0-100). null = unknown. */
  recoveryPct: number | null;
  /** Follow vehicle distance to rider in feet. null = unknown. */
  followDistanceFt: number | null;
}

export interface RuleEvaluation {
  code: string;
  status: RuleStatus;
  severity: RuleSeverity;
  title: string;
  detail?: string;
  /** Extra structured context for display. */
  context?: Record<string, unknown>;
}

export type RuleFn = (ctx: RuleContext) => RuleEvaluation | null;

// --------- helpers ---------

export function isNight(ctx: RuleContext): boolean {
  if (ctx.visibilityFt !== null && ctx.visibilityFt < 1000) return true;
  return ctx.localHour >= 19 || ctx.localHour < 7;
}

/** Return count of recent minutes with speed < thresholdMph. */
function minutesBelow(recent: number[], thresholdMph: number): number {
  let count = 0;
  for (const s of recent) {
    if (s >= thresholdMph) break;
    count += 1;
  }
  return count;
}

// --------- rule implementations (subset evaluable from available data) ---------

export const RULE_90_MIN: RuleFn = (ctx) => {
  const night = isNight(ctx);
  const low = minutesBelow(ctx.recentSpeedsMph, 9);
  if (!night) return null;
  if (low >= 15) {
    return {
      code: "90_MIN_RULE",
      status: "triggered",
      severity: "critical",
      title: "90-min rule triggered — force sleep intervention",
      detail: `Speed <9 mph for ${low} min in night window. Pull over, 20-min nap, 200mg caffeine, warm layers.`,
      context: { low_minutes: low, threshold: 9 },
    };
  }
  if (low >= 10) {
    return {
      code: "90_MIN_RULE",
      status: "warn",
      severity: "warn",
      title: "90-min rule approaching — pre-empt sleep",
      detail: `Speed <9 mph for ${low} min. If 15+ min total → forced sleep.`,
      context: { low_minutes: low },
    };
  }
  return null;
};

export const RULE_GPS_60MIN: RuleFn = (ctx) => {
  if (!ctx.lastGpsPingIso) {
    return {
      code: "1442_GPS_TRACKER_60MIN",
      status: "warn",
      severity: "warn",
      title: "No GPS tracker ping recorded yet",
    };
  }
  const diffMin =
    (ctx.nowUtc.getTime() - new Date(ctx.lastGpsPingIso).getTime()) / 60_000;
  if (diffMin > 60) {
    return {
      code: "1442_GPS_TRACKER_60MIN",
      status: "violation",
      severity: "critical",
      title: "GPS tracker silent >60 min — call Race HQ now",
      detail: `Last ping ${Math.floor(diffMin)} min ago. Rule 1442 requires HQ notification.`,
      context: { silence_min: Math.floor(diffMin) },
    };
  }
  if (diffMin > 30) {
    return {
      code: "1442_GPS_TRACKER_60MIN",
      status: "warn",
      severity: "warn",
      title: "GPS tracker silent >30 min",
      detail: `Last ping ${Math.floor(diffMin)} min ago. Check tracker battery.`,
      context: { silence_min: Math.floor(diffMin) },
    };
  }
  return null;
};

export const RULE_RRS_30MIN: RuleFn = (ctx) => {
  if (!ctx.lastTsArrivalIso) return null;
  if (ctx.rrsCheckedIn) return null;
  const diffMin =
    (ctx.nowUtc.getTime() - new Date(ctx.lastTsArrivalIso).getTime()) / 60_000;
  if (diffMin > 30) {
    return {
      code: "1440_RRS_CHECKIN_30MIN",
      status: "violation",
      severity: "warn",
      title: "RRS check-in overdue — >30 min since TS arrival",
      detail: `Arrived ${Math.floor(diffMin)} min ago. Check in now or report delay.`,
      context: { overdue_min: Math.floor(diffMin) },
    };
  }
  if (diffMin > 20) {
    return {
      code: "1440_RRS_CHECKIN_30MIN",
      status: "warn",
      severity: "warn",
      title: "RRS check-in window closes soon",
      detail: `${Math.floor(30 - diffMin)} min left to check in.`,
      context: { remaining_min: Math.floor(30 - diffMin) },
    };
  }
  return null;
};

export const RULE_NIGHT_30FT_FOLLOW: RuleFn = (ctx) => {
  if (!isNight(ctx)) return null;
  if (ctx.followDistanceFt === null) return null;
  if (ctx.followDistanceFt > 30) {
    return {
      code: "1460_30FT_FOLLOW",
      status: "violation",
      severity: "critical",
      title: `Follow vehicle ${ctx.followDistanceFt} ft from rider at night`,
      detail:
        "Night protocol requires Direct Follow within 30 ft. Close the gap immediately.",
      context: { distance_ft: ctx.followDistanceFt },
    };
  }
  return null;
};

export const RULE_NIGHT_DIRECT_FOLLOW: RuleFn = (ctx) => {
  if (!isNight(ctx)) return null;
  if (ctx.followDistanceFt === null) {
    return {
      code: "1460_NIGHT_DIRECT_FOLLOW",
      status: "warn",
      severity: "warn",
      title: "Night: Direct Follow mandatory — confirm Follow Vehicle in position",
    };
  }
  return null;
};

export const RULE_PENALTY_DQ: RuleFn = (ctx) => {
  if (ctx.penaltyCount >= 5) {
    return {
      code: "240_5_PENALTY_DQ",
      status: "triggered",
      severity: "critical",
      title: "5 penalties accumulated — DQ triggered",
      detail: "Executive Management makes final DQ call. Contact HQ.",
      context: { count: ctx.penaltyCount },
    };
  }
  if (ctx.penaltyCount >= 3) {
    return {
      code: "240_5_PENALTY_DQ",
      status: "warn",
      severity: "critical",
      title: `${ctx.penaltyCount} penalties — ${5 - ctx.penaltyCount} away from DQ`,
    };
  }
  if (ctx.penaltyCount >= 1) {
    return {
      code: "240_5_PENALTY_DQ",
      status: "warn",
      severity: "warn",
      title: `${ctx.penaltyCount} penalty${ctx.penaltyCount > 1 ? "ies" : ""} on record`,
      context: { count: ctx.penaltyCount },
    };
  }
  return null;
};

export const RULE_SHERMER: RuleFn = (ctx) => {
  if (ctx.recoveryPct === null) return null;
  const risk = ctx.awakeHours * (100 - ctx.recoveryPct);
  if (risk > 1500) {
    return {
      code: "SHERMERS_AWAKE_RECOVERY",
      status: "triggered",
      severity: "critical",
      title: "Shermer's neck risk CRITICAL — consider pulling rider",
      detail: `Awake ${ctx.awakeHours}h × (100 − ${ctx.recoveryPct}%) = ${Math.round(risk)}`,
      context: { risk, awake_h: ctx.awakeHours, recovery: ctx.recoveryPct },
    };
  }
  if (risk > 1200) {
    return {
      code: "SHERMERS_AWAKE_RECOVERY",
      status: "warn",
      severity: "critical",
      title: "Shermer's neck risk HIGH",
      detail: `Product ${Math.round(risk)}. Force extended sleep at next TS.`,
      context: { risk },
    };
  }
  return null;
};

export const RULE_REGIONAL_UT: RuleFn = (ctx) => {
  if (ctx.state !== "UT") return null;
  if (ctx.followDistanceFt === null) {
    return {
      code: "1405_UT_DIRECT_FOLLOW",
      status: "warn",
      severity: "warn",
      title: "UT zone: Direct Follow mandatory day + night",
    };
  }
  if (ctx.followDistanceFt > 30) {
    return {
      code: "1405_UT_DIRECT_FOLLOW",
      status: "violation",
      severity: "warn",
      title: `UT: Direct Follow mandatory, ${ctx.followDistanceFt} ft gap too large`,
    };
  }
  return null;
};

export const RULE_REGIONAL_CO_DAY_LEAPFROG: RuleFn = (ctx) => {
  if (ctx.state !== "CO") return null;
  if (isNight(ctx)) return null;
  return {
    code: "1405_CO_LEAPFROG_DAY",
    status: "warn",
    severity: "info",
    title: "CO day zone: Leapfrog MANDATORY, Direct Follow prohibited",
    detail: "Switch to leapfrog until CO/KS state line or sundown.",
  };
};

// --------- registry ---------

export const ALL_RULES: RuleFn[] = [
  RULE_90_MIN,
  RULE_GPS_60MIN,
  RULE_RRS_30MIN,
  RULE_NIGHT_30FT_FOLLOW,
  RULE_NIGHT_DIRECT_FOLLOW,
  RULE_PENALTY_DQ,
  RULE_SHERMER,
  RULE_REGIONAL_UT,
  RULE_REGIONAL_CO_DAY_LEAPFROG,
];

export function evaluateRules(ctx: RuleContext): RuleEvaluation[] {
  return ALL_RULES.map((r) => r(ctx)).filter(
    (e): e is RuleEvaluation => e !== null,
  );
}
