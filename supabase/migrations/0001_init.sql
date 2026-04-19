-- RAAM 2026 Command & Control — initial schema
-- Racer: Kabir Rachure (#610, Solo Men Under 50)
-- Start: 2026-06-16 12:00 PDT | Hard Finish: 2026-06-29 15:00 EDT

-- =========================
-- ROLES & CREW
-- =========================
create type crew_role as enum (
  'crew_chief',
  'cc_operator',
  'follow_driver',
  'shuttle_driver',
  'rv_crew',
  'media',
  'rider',
  'observer'
);

create table if not exists crew_member (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  role crew_role not null,
  phone text,
  email text,
  emergency_contact text,
  active boolean default true,
  created_at timestamptz default now()
);

-- =========================
-- TIME STATIONS (54 + start)
-- =========================
create table if not exists time_station (
  ts_num int primary key,
  name text not null,
  state text not null,
  mile_total numeric(8,2) not null,
  miles_to_fin numeric(8,2) not null,
  lat numeric(10,7),
  lng numeric(10,7),
  split_2023_elapsed text,
  avg_speed_2023 numeric(5,2),
  avg_this_ts_2023 numeric(5,2),
  arrival_ts_edt timestamptz,
  rrs_check_in_ts_edt timestamptz,
  rrs_confirmation_code text,
  reporter_crew_id uuid references crew_member(id),
  notes text
);

-- =========================
-- GPS / POSITION
-- =========================
create table if not exists gps_ping (
  id bigserial primary key,
  ts timestamptz not null default now(),
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  speed_mph numeric(5,2),
  heading int,
  source text default 'raam_tracker'
);
create index if not exists idx_gps_ping_ts on gps_ping(ts desc);

-- =========================
-- NUTRITION
-- =========================
create table if not exists nutrition_log (
  id uuid primary key default gen_random_uuid(),
  logged_at timestamptz not null default now(),
  carbs_g numeric(6,1) default 0,
  water_ml numeric(7,1) default 0,
  sodium_mg numeric(7,1) default 0,
  calories_kcal numeric(7,1) default 0,
  notes text,
  logged_by uuid references crew_member(id)
);
create index if not exists idx_nutrition_time on nutrition_log(logged_at desc);

-- =========================
-- REST / SLEEP
-- =========================
create table if not exists rest_log (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_min int generated always as (
    case when ended_at is null then null
    else extract(epoch from (ended_at - started_at))::int / 60
    end
  ) stored,
  location text,
  whoop_recovery int,
  notes text,
  logged_by uuid references crew_member(id)
);

-- =========================
-- CREW SHIFTS
-- =========================
create table if not exists crew_shift (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references crew_member(id),
  vehicle text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  notes text
);

-- =========================
-- PENALTIES / WARNINGS
-- =========================
create type penalty_kind as enum ('warning', 'penalty_1h', 'dq');

create table if not exists penalty (
  id uuid primary key default gen_random_uuid(),
  issued_at timestamptz not null default now(),
  kind penalty_kind not null,
  rule_ref text,
  description text not null,
  issued_by text,
  ts_num int references time_station(ts_num),
  resolved boolean default false
);

-- =========================
-- ALERTS
-- =========================
create type alert_severity as enum ('info', 'warn', 'critical');
create type alert_status as enum ('open', 'ack', 'resolved');

create table if not exists alert (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rule_id text not null,
  severity alert_severity not null,
  title text not null,
  body text,
  status alert_status default 'open',
  ack_by uuid references crew_member(id),
  ack_at timestamptz
);
create index if not exists idx_alert_open on alert(status, created_at desc);

-- =========================
-- GEAR / BIKES / VEHICLES
-- =========================
create table if not exists bike (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  model text,
  serial text,
  current_odometer_mi numeric(8,1) default 0,
  notes text
);

create table if not exists bike_service_log (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid references bike(id),
  performed_at timestamptz not null default now(),
  item text not null,
  action text not null,
  notes text,
  performed_by uuid references crew_member(id)
);

create table if not exists support_vehicle (
  id uuid primary key default gen_random_uuid(),
  call_sign text not null,
  category text not null,
  plate text,
  driver_1_crew_id uuid references crew_member(id),
  driver_2_crew_id uuid references crew_member(id),
  notes text
);

-- =========================
-- BIKE SHOPS
-- =========================
create type shop_tier as enum ('tier_1', 'tier_2', 'tier_3');

create table if not exists bike_shop (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier shop_tier not null,
  capabilities text[] not null default '{}',
  address text,
  city text,
  state text,
  lat numeric(10,7),
  lng numeric(10,7),
  phone text,
  email text,
  hours text,
  closest_ts int references time_station(ts_num),
  notes text
);

-- =========================
-- WEATHER CACHE
-- =========================
create table if not exists weather_forecast (
  id bigserial primary key,
  fetched_at timestamptz default now(),
  for_time timestamptz not null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  temp_f numeric(5,1),
  feels_like_f numeric(5,1),
  wind_mph numeric(5,1),
  wind_deg int,
  precip_mm numeric(5,2),
  conditions text,
  source text default 'openweather'
);

-- =========================
-- COMMS LOG
-- =========================
create table if not exists comms_log (
  id bigserial primary key,
  ts timestamptz default now(),
  channel text not null,
  direction text not null,
  from_party text,
  to_party text,
  subject text,
  body text,
  crew_id uuid references crew_member(id)
);
create index if not exists idx_comms_ts on comms_log(ts desc);

-- =========================
-- SOCIAL QUEUE
-- =========================
create type social_platform as enum ('instagram', 'facebook', 'x', 'linkedin');
create type post_status as enum ('draft', 'pending_review', 'approved', 'posted', 'failed');

create table if not exists social_post (
  id uuid primary key default gen_random_uuid(),
  platform social_platform not null,
  handle text not null,
  caption text,
  media_url text,
  scheduled_at timestamptz,
  status post_status default 'draft',
  trigger_reason text,
  approved_by uuid references crew_member(id),
  created_at timestamptz default now()
);
