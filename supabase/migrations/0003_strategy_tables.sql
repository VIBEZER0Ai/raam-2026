-- RAAM 2026 Strategy tables — from Kabir's Race Strategy & Crew Operations Report
-- Source: 3-year analysis (2019, 2022, 2023) | Target: Sub 10d 6h (12.2+ mph)

-- =========================
-- TARGET RACE PLAN — arrival time + speed for every TS
-- =========================
create table if not exists target_plan (
  ts_num int primary key references time_station(ts_num),
  target_arr_race_day int not null, -- 0-10 (day of race)
  target_arr_time text not null, -- "16:00" local
  target_speed_mph numeric(5,2),
  notes text
);
alter table target_plan enable row level security;
create policy "public_read_target_plan" on target_plan for select using (true);

-- =========================
-- SLEEP BLOCKS — 6 polyphasic events, max 2h 30m total
-- =========================
create table if not exists sleep_block (
  event_num int primary key,
  location text not null,
  race_day text not null, -- "Day 1 night", "Day 4 midday"
  max_duration_min int not null,
  near_ts_num int references time_station(ts_num),
  skip_trigger text,
  notes text
);
alter table sleep_block enable row level security;
create policy "public_read_sleep_block" on sleep_block for select using (true);

-- =========================
-- NIGHT WINDOWS — 10 crash-risk zones, 01:00-05:00 local
-- =========================
create type risk_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

create table if not exists night_window (
  night_num int primary key,
  location text not null,
  mile_start numeric(8,1) not null,
  mile_end numeric(8,1) not null,
  low_speed_2019 numeric(5,2),
  low_speed_2022 numeric(5,2),
  low_speed_2023 numeric(5,2),
  priority risk_level not null,
  assessment text
);
alter table night_window enable row level security;
create policy "public_read_night_window" on night_window for select using (true);

-- =========================
-- CRITICAL SEGMENTS — where 2022 lost >30% vs best
-- =========================
create table if not exists critical_segment (
  id uuid primary key default gen_random_uuid(),
  from_station text not null,
  to_station text not null,
  mile_start numeric(8,1),
  mile_end numeric(8,1),
  speed_2019 numeric(5,2),
  speed_2022 numeric(5,2),
  speed_2023 numeric(5,2),
  best_speed numeric(5,2),
  severity risk_level not null,
  notes text
);
alter table critical_segment enable row level security;
create policy "public_read_critical_segment" on critical_segment for select using (true);

-- =========================
-- NUTRITION PHASES — 4 race phases with kcal/hr + risk
-- =========================
create table if not exists nutrition_phase (
  id int primary key,
  phase_name text not null,
  race_hour_start int not null,
  race_hour_end int not null,
  kcal_per_hr_low int,
  kcal_per_hr_high int,
  primary_source text,
  hydration_ml_hr_low int,
  hydration_ml_hr_high int,
  key_risk text
);
alter table nutrition_phase enable row level security;
create policy "public_read_nutrition_phase" on nutrition_phase for select using (true);

-- =========================
-- CAFFEINE PROTOCOL
-- =========================
create table if not exists caffeine_protocol (
  id int primary key,
  trigger_name text not null,
  dose_mg int,
  delivery_method text
);
alter table caffeine_protocol enable row level security;
create policy "public_read_caffeine_protocol" on caffeine_protocol for select using (true);

-- =========================
-- CONTINGENCY PLANS
-- =========================
create table if not exists contingency_plan (
  id uuid primary key default gen_random_uuid(),
  scenario text not null,
  severity risk_level not null,
  steps text[] not null default '{}',
  sort_order int default 0
);
alter table contingency_plan enable row level security;
create policy "public_read_contingency_plan" on contingency_plan for select using (true);

-- =========================
-- PRE-RACE CHECKLIST
-- =========================
create table if not exists pre_race_checklist (
  id uuid primary key default gen_random_uuid(),
  stage text not null, -- "12 weeks", "4 weeks", "48 hours", "race day"
  item text not null,
  done boolean default false,
  done_by uuid references crew_member(id),
  done_at timestamptz,
  sort_order int default 0
);
alter table pre_race_checklist enable row level security;
create policy "public_read_pre_race_checklist" on pre_race_checklist for select using (true);

-- =========================
-- CREW ROLES (specialized — beyond generic crew_role enum)
-- =========================
create table if not exists crew_role_spec (
  id int primary key,
  role_name text not null,
  responsibility text,
  shift_pattern text,
  critical_skill text
);
alter table crew_role_spec enable row level security;
create policy "public_read_crew_role_spec" on crew_role_spec for select using (true);

-- =========================
-- 90-MINUTE RULE constant
-- =========================
create table if not exists race_protocol (
  key text primary key,
  value text not null,
  description text
);
alter table race_protocol enable row level security;
create policy "public_read_race_protocol" on race_protocol for select using (true);
