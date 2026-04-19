/**
 * RAAM 2026 — Race constants for Coach Kabir Rachure (Solo Men Under 50, #610).
 * Sources: 2026 RAAM Rules (Jan 2026), 2026 GEAR Book (Jan 2026).
 */

export const RACE = {
  year: 2026,
  edition: 44,

  racer: {
    name: "Kabir Rachure",
    number: 610,
    division: "Solo Men Under 50",
    category: "solo",
    bike_type: "Standard (Diamond Frame)",
  },

  start: {
    location: "Oceanside, CA (The Strand, N of Oceanside Pier)",
    datetime_pdt: "2026-06-16T12:00:00-07:00",
    datetime_edt: "2026-06-16T15:00:00-04:00",
    datetime_utc: "2026-06-16T19:00:00Z",
  },

  finish: {
    location: "Kennedy Plaza, Atlantic City, NJ",
    timing_line: "US 40/Albany Ave & Crossan Ave",
    timing_ends_at: "Surf Stadium",
    fixed_add_minutes_solo: 10,
    hard_cutoff_edt: "2026-06-29T15:00:00-04:00",
    hard_cutoff_utc: "2026-06-29T19:00:00Z",
  },

  course: {
    distance_miles: 3068.2,
    time_stations: 54,
    states_crossed: 13,
    elevation_gain_ft: 170_000,
    time_zones: 4,
    official_race_time_tz: "America/New_York",
  },

  division_cutoffs: {
    solo_men_under_50_hours: 288,
    solo_men_60_69_hours: 309,
    solo_men_70plus_hours: 317,
    solo_women_hours: 309,
    solo_women_60plus_hours: 317,
    teams_hours: 216,
    teams_80plus_hours: 228,
  },

  intermediate_checkpoints: [
    {
      ts: 15,
      name: "Durango, CO",
      solo_men_under_50_cutoff_edt: "2026-06-20T00:00:00-04:00",
      elapsed_hours_from_start: 81,
      hard: false,
    },
    {
      ts: 35,
      name: "Mississippi River",
      solo_men_under_50_cutoff_edt: "2026-06-24T15:00:00-04:00",
      elapsed_hours_from_start: 192,
      hard: false,
    },
    {
      ts: 54,
      name: "Atlantic City, NJ",
      solo_men_under_50_cutoff_edt: "2026-06-29T15:00:00-04:00",
      elapsed_hours_from_start: 288,
      hard: true,
    },
  ],

  shuttles: [
    {
      name: "Oak Creek Canyon Shuttle",
      location: "Sedona, AZ (TS8 region)",
      distance_miles: 20.1,
      fixed_add_minutes_solo: 60,
    },
    {
      name: "Delaware Memorial Bridge Shuttle",
      location: "Delaware/NJ border",
      distance_miles: 4.6,
      fixed_add_minutes_solo: 0,
    },
  ],

  nutrition_hourly_target: {
    carbs_g: { min: 60, max: 90 },
    water_ml: { min: 500, max: 750 },
    sodium_mg: { min: 500, max: 1000 },
    calories_kcal: { min: 250, max: 350 },
  },

  night_time: {
    starts_local: "19:00",
    ends_local: "07:00",
    visibility_threshold_ft: 1000,
  },

  baseline_2023: {
    total_time_ddhhmm: "10d 18h 1m",
    total_hours: 258.02,
    avg_speed_mph: 11.38,
    finish_status: "Official",
  },
} as const;

export type RaceConfig = typeof RACE;
