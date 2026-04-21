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
      "ts_num,name,state,mile_total,miles_to_fin,split_2023_elapsed,avg_speed_2023,avg_this_ts_2023,arrival_ts_edt",
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
