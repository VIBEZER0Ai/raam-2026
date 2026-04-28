#!/usr/bin/env tsx
/**
 * Emit migration SQL that reseeds time_station with the official 2026 list:
 * names + miles from time-stations-2026.ts, lat/lng from ts-waypoints.json,
 * flags as jsonb. Adds the `flags` column if missing.
 *
 * Usage:
 *   pnpm tsx scripts/gen-2026-migration.ts > supabase/migrations/0020_time_station_2026.sql
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { TIME_STATIONS_2026 } from "../src/lib/raam/time-stations-2026";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

interface Wpt {
  ts_num: number;
  lat: number;
  lon: number;
  ele_m: number;
}

async function main() {
  const wptsRaw = await readFile(
    join(ROOT, "public", "raam", "ts-waypoints.json"),
    "utf8",
  );
  const wpts: { waypoints: Wpt[] } = JSON.parse(wptsRaw);
  const byTs = new Map(wpts.waypoints.map((w) => [w.ts_num, w]));

  const lines: string[] = [];
  lines.push(
    "-- 0020_time_station_2026.sql",
    "-- Reseed time_station with official 2026 RAAM route (54 TS + finish).",
    "-- Source: 2026_RAAM_Route_Book_FINAL.pdf + RidewithGPS route 54768164.",
    "-- Eastern half rerouted vs 2023: now ends Atlantic City NJ via Darlington MD + Malaga NJ.",
    "-- Total race distance: 3068.2 mi.",
    "",
    "-- Add section-flag column (rule constraints active in the segment ENTERING this TS).",
    "alter table time_station",
    "  add column if not exists flags jsonb not null default '[]'::jsonb;",
    "",
    "-- Reseed via UPSERT — TS rows are referenced by target_plan, sleep_plan, rule_evaluation, gps_matched.",
    "-- All 2023 split / pacing columns are nulled so AA-cron rebuilds them for 2026.",
    "update time_station",
    "   set arrival_ts_edt = null,",
    "       split_2023_elapsed = null,",
    "       avg_speed_2023 = null,",
    "       avg_this_ts_2023 = null;",
    "",
    "insert into time_station (ts_num, name, state, mile_total, miles_to_fin, lat, lng, flags) values",
  );

  const rows: string[] = [];
  for (const ts of TIME_STATIONS_2026) {
    const wpt = byTs.get(ts.ts_num);
    const lat = wpt ? wpt.lat.toFixed(6) : "null";
    const lng = wpt ? wpt.lon.toFixed(6) : "null";
    const flags = JSON.stringify(ts.flags ?? []);
    const name = ts.name.replace(/'/g, "''");
    rows.push(
      `  (${ts.ts_num}, '${name}', '${ts.state}', ${ts.mile_total}, ${ts.miles_to_fin}, ${lat}, ${lng}, '${flags}'::jsonb)`,
    );
  }
  lines.push(
    rows.join(",\n") +
      "\non conflict (ts_num) do update set" +
      "\n  name = excluded.name," +
      "\n  state = excluded.state," +
      "\n  mile_total = excluded.mile_total," +
      "\n  miles_to_fin = excluded.miles_to_fin," +
      "\n  lat = excluded.lat," +
      "\n  lng = excluded.lng," +
      "\n  flags = excluded.flags;",
  );
  lines.push(
    "",
    "-- Index on flags for fast section-rule queries.",
    "create index if not exists time_station_flags_gin on time_station using gin (flags);",
    "",
  );

  process.stdout.write(lines.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
