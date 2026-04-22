/**
 * Server-side Supabase query helpers for RAAM 2026 dashboard.
 * Uses the SSR server client — safe for Server Components.
 */

import { createClient } from "@/lib/supabase/server";

export interface DbTimeStation {
  ts_num: number;
  name: string;
  state: string;
  mile_total: number;
  miles_to_fin: number;
  lat: number | null;
  lng: number | null;
  split_2023_elapsed: string | null;
  avg_speed_2023: number | null;
  avg_this_ts_2023: number | null;
  arrival_ts_edt: string | null;
}

export interface DbTargetPlan {
  ts_num: number;
  target_arr_race_day: number;
  target_arr_time: string;
  target_speed_mph: number | null;
  notes: string | null;
}

export interface DbSleepBlock {
  event_num: number;
  location: string;
  race_day: string;
  max_duration_min: number;
  near_ts_num: number | null;
  skip_trigger: string | null;
}

export interface DbNightWindow {
  night_num: number;
  location: string;
  mile_start: number;
  mile_end: number;
  low_speed_2023: number | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assessment: string | null;
}

export interface DbCriticalSegment {
  id: string;
  from_station: string;
  to_station: string;
  mile_start: number | null;
  mile_end: number | null;
  speed_2023: number | null;
  best_speed: number | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface DbRaceProtocol {
  key: string;
  value: string;
  description: string | null;
}

export async function getTimeStations(): Promise<DbTimeStation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_station")
    .select(
      "ts_num,name,state,mile_total,miles_to_fin,lat,lng,split_2023_elapsed,avg_speed_2023,avg_this_ts_2023,arrival_ts_edt",
    )
    .order("ts_num", { ascending: true });
  if (error) {
    console.error("[getTimeStations]", error);
    return [];
  }
  return (data ?? []) as DbTimeStation[];
}

export async function getTargetPlan(): Promise<DbTargetPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("target_plan")
    .select("*")
    .order("ts_num", { ascending: true });
  if (error) {
    console.error("[getTargetPlan]", error);
    return [];
  }
  return (data ?? []) as DbTargetPlan[];
}

export async function getSleepBlocks(): Promise<DbSleepBlock[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sleep_block")
    .select("*")
    .order("event_num", { ascending: true });
  if (error) {
    console.error("[getSleepBlocks]", error);
    return [];
  }
  return (data ?? []) as DbSleepBlock[];
}

export async function getNightWindows(): Promise<DbNightWindow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("night_window")
    .select(
      "night_num,location,mile_start,mile_end,low_speed_2023,priority,assessment",
    )
    .order("night_num", { ascending: true });
  if (error) {
    console.error("[getNightWindows]", error);
    return [];
  }
  return (data ?? []) as DbNightWindow[];
}

export async function getCriticalSegments(): Promise<DbCriticalSegment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("critical_segment")
    .select(
      "id,from_station,to_station,mile_start,mile_end,speed_2023,best_speed,severity",
    );
  if (error) {
    console.error("[getCriticalSegments]", error);
    return [];
  }
  return (data ?? []) as DbCriticalSegment[];
}

export async function getRaceProtocol(): Promise<DbRaceProtocol[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("race_protocol").select("*");
  if (error) {
    console.error("[getRaceProtocol]", error);
    return [];
  }
  return (data ?? []) as DbRaceProtocol[];
}

export interface DbRule {
  code: string;
  category:
    | "time"
    | "night"
    | "geo"
    | "safety"
    | "support"
    | "racer"
    | "penalty"
    | "nutrition"
    | "sleep";
  kind: "prohibit" | "require" | "monitor" | "trigger";
  severity: "info" | "warn" | "critical";
  name: string;
  description: string;
  source_ref: string | null;
  dq_trigger: boolean;
  sort_order: number;
}

export interface DbNutritionLog {
  id: string;
  logged_at: string;
  carbs_g: number | null;
  water_ml: number | null;
  sodium_mg: number | null;
  caffeine_mg: number | null;
  calories_kcal: number | null;
  notes: string | null;
  logged_by: string | null;
}

export interface NutritionRollup {
  hourly: {
    carbs_g: number;
    water_ml: number;
    sodium_mg: number;
    caffeine_mg: number;
    calories_kcal: number;
  };
  three_hour: {
    carbs_g: number;
    water_ml: number;
    sodium_mg: number;
    caffeine_mg: number;
    calories_kcal: number;
    entry_count: number;
  };
}

export async function getRecentNutrition(
  limit = 30,
): Promise<DbNutritionLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nutrition_log")
    .select("*")
    .order("logged_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getRecentNutrition]", error);
    return [];
  }
  return (data ?? []) as DbNutritionLog[];
}

export async function getNutritionRollup(): Promise<NutritionRollup> {
  const supabase = await createClient();
  const threeHrAgo = new Date(Date.now() - 3 * 3_600_000).toISOString();
  const { data } = await supabase
    .from("nutrition_log")
    .select("logged_at,carbs_g,water_ml,sodium_mg,caffeine_mg,calories_kcal")
    .gt("logged_at", threeHrAgo);
  const rows = (data ?? []) as Pick<
    DbNutritionLog,
    | "logged_at"
    | "carbs_g"
    | "water_ml"
    | "sodium_mg"
    | "caffeine_mg"
    | "calories_kcal"
  >[];

  const oneHrAgoMs = Date.now() - 3_600_000;
  const hourly = { carbs_g: 0, water_ml: 0, sodium_mg: 0, caffeine_mg: 0, calories_kcal: 0 };
  const three_hour = { carbs_g: 0, water_ml: 0, sodium_mg: 0, caffeine_mg: 0, calories_kcal: 0, entry_count: 0 };
  for (const r of rows) {
    const ts = new Date(r.logged_at).getTime();
    const inHour = ts >= oneHrAgoMs;
    three_hour.entry_count += 1;
    for (const k of [
      "carbs_g",
      "water_ml",
      "sodium_mg",
      "caffeine_mg",
      "calories_kcal",
    ] as const) {
      const v = Number(r[k] ?? 0);
      three_hour[k] += v;
      if (inHour) hourly[k] += v;
    }
  }
  return { hourly, three_hour };
}

export interface DbRestLog {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_min: number | null;
  location: string | null;
  whoop_recovery: number | null;
  notes: string | null;
  logged_by: string | null;
}

export interface AwakeStatus {
  /** Latest rest row (open or closed), or null if none yet. */
  latest: DbRestLog | null;
  /** Open block (ended_at IS NULL) — rider currently sleeping. */
  open: DbRestLog | null;
  /** Hours since the most recent rest block ended. 0 if currently sleeping. */
  awakeHours: number;
  /** Last recorded recovery % (from rest_log.whoop_recovery). null = unknown. */
  recoveryPct: number | null;
  /** Shermer product: awakeHours × (100 - recovery). null if recovery unknown. */
  shermerScore: number | null;
  /** Risk tier per strategy thresholds (1200/1500). */
  shermerRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";
}

export async function getRecentRestLogs(limit = 20): Promise<DbRestLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rest_log")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getRecentRestLogs]", error);
    return [];
  }
  return (data ?? []) as DbRestLog[];
}

export async function getAwakeStatus(): Promise<AwakeStatus> {
  const rows = await getRecentRestLogs(10);
  if (rows.length === 0) {
    return {
      latest: null,
      open: null,
      awakeHours: 0,
      recoveryPct: null,
      shermerScore: null,
      shermerRisk: "UNKNOWN",
    };
  }
  const latest = rows[0];
  const open = rows.find((r) => r.ended_at === null) ?? null;
  const lastEnded = rows.find((r) => r.ended_at !== null) ?? null;
  const awakeMs = open
    ? 0
    : lastEnded
      ? Math.max(0, Date.now() - new Date(lastEnded.ended_at!).getTime())
      : 0;
  const awakeHours = Number((awakeMs / 3_600_000).toFixed(1));
  const recoveryRow = rows.find((r) => r.whoop_recovery !== null);
  const recoveryPct = recoveryRow?.whoop_recovery ?? null;
  const shermerScore =
    recoveryPct !== null ? awakeHours * (100 - recoveryPct) : null;
  const shermerRisk: AwakeStatus["shermerRisk"] =
    shermerScore === null
      ? "UNKNOWN"
      : shermerScore > 1500
        ? "CRITICAL"
        : shermerScore > 1200
          ? "HIGH"
          : shermerScore > 800
            ? "MEDIUM"
            : "LOW";
  return {
    latest,
    open,
    awakeHours,
    recoveryPct,
    shermerScore,
    shermerRisk,
  };
}

export interface DbCommsLog {
  id: number;
  ts: string;
  channel: string;
  direction: "in" | "out";
  from_party: string | null;
  to_party: string | null;
  subject: string | null;
  body: string | null;
  crew_id: string | null;
}

export async function getRecentComms(limit = 50): Promise<DbCommsLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comms_log")
    .select("*")
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getRecentComms]", error);
    return [];
  }
  return (data ?? []) as DbCommsLog[];
}

export interface DbCrewMember {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  role:
    | "crew_chief"
    | "cc_operator"
    | "follow_driver"
    | "shuttle_driver"
    | "rv_crew"
    | "media"
    | "rider"
    | "observer";
  title: string | null;
  initials: string | null;
  color: string | null;
  phone: string | null;
  email: string | null;
  emergency_contact: string | null;
  active: boolean;
  created_at: string;
}

export async function getCrewMembers(): Promise<DbCrewMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crew_member")
    .select("*")
    .eq("active", true)
    .order("full_name", { ascending: true });
  if (error) {
    console.error("[getCrewMembers]", error);
    return [];
  }
  return (data ?? []) as DbCrewMember[];
}

export async function getRules(): Promise<DbRule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rule")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[getRules]", error);
    return [];
  }
  return (data ?? []) as DbRule[];
}

export interface DbPenalty {
  id: string;
  issued_at: string;
  kind: "warning" | "penalty_1h" | "dq";
  rule_ref: string | null;
  description: string;
  issued_by: string | null;
  ts_num: number | null;
  resolved: boolean;
}

export interface PenaltyLedger {
  penalties: DbPenalty[];
  warning_count: number;
  penalty_1h_count: number;
  dq_count: number;
  /** Official 1h penalties — the only ones that count toward the 5-penalty DQ threshold. */
  dq_risk_count: number;
}

export interface DbGpsPing {
  id: number;
  ts: string;
  lat: number;
  lng: number;
  speed_mph: number | null;
  heading: number | null;
  source: string | null;
  mile_from_start: number | null;
  state: string | null;
  device_id: string | null;
  note: string | null;
  matched_lat: number | null;
  matched_lng: number | null;
  match_confidence: number | null;
}

export interface DerivedRaceState {
  /** Most recent ping — source of truth for position + speed. */
  latest: DbGpsPing | null;
  /** Most recent N pings (newest first) for rolling averages. */
  recent: DbGpsPing[];
  /** Current mile from start, with fallback. */
  currentMile: number;
  /** Current speed mph, with fallback. */
  currentSpeed: number;
  /** ISO of latest ping (for GPS-silence rule). null = no ping ever. */
  lastGpsPingIso: string | null;
  /** State from latest ping, falls back to "CA" at start. */
  state: string;
  /** Recent speeds (newest first), padded with latest if sparse. */
  recentSpeedsMph: number[];
  /** Current TS number — derived by highest mile_total ≤ currentMile. */
  currentTs: number;
}

export async function getRecentGpsPings(limit = 30): Promise<DbGpsPing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gps_ping")
    .select("*")
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getRecentGpsPings]", error);
    return [];
  }
  return (data ?? []) as DbGpsPing[];
}

export async function getDerivedRaceState(): Promise<DerivedRaceState> {
  const [pings, stations] = await Promise.all([
    getRecentGpsPings(60),
    getTimeStations(),
  ]);
  const latest = pings[0] ?? null;
  const currentMile = latest?.mile_from_start ?? 0;
  const currentSpeed = latest?.speed_mph ?? 0;
  const lastGpsPingIso = latest?.ts ?? null;
  const state = latest?.state ?? "CA";
  const recentSpeedsMph = pings
    .map((p) => p.speed_mph)
    .filter((s): s is number => s !== null);
  // Resolve TS: highest ts_num whose mile_total ≤ currentMile
  let currentTs = 0;
  for (const ts of stations) {
    if (Number(ts.mile_total) <= Number(currentMile)) {
      currentTs = ts.ts_num;
    } else {
      break;
    }
  }
  return {
    latest,
    recent: pings,
    currentMile: Number(currentMile) || 0,
    currentSpeed: Number(currentSpeed) || 0,
    lastGpsPingIso,
    state,
    recentSpeedsMph,
    currentTs,
  };
}

export async function getPenaltyLedger(): Promise<PenaltyLedger> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("penalty")
    .select("*")
    .order("issued_at", { ascending: false });
  if (error) {
    console.error("[getPenaltyLedger]", error);
    return {
      penalties: [],
      warning_count: 0,
      penalty_1h_count: 0,
      dq_count: 0,
      dq_risk_count: 0,
    };
  }
  const rows = (data ?? []) as DbPenalty[];
  const warning_count = rows.filter((p) => p.kind === "warning").length;
  const penalty_1h_count = rows.filter((p) => p.kind === "penalty_1h").length;
  const dq_count = rows.filter((p) => p.kind === "dq").length;
  return {
    penalties: rows,
    warning_count,
    penalty_1h_count,
    dq_count,
    dq_risk_count: penalty_1h_count,
  };
}
