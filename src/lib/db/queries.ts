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
