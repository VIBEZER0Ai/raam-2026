-- 0022_stop_requests_and_vehicles.sql
-- AA6.1 + AA6.3 + AA6.9 schema: stop-request lifecycle, vehicle entity model,
-- and live vehicle position pings for the Vehicle Status screen.

-- =========================
-- Backfill team_id on support_vehicle (missed in 0017_multi_tenant)
-- =========================
do $$
begin
  if exists (select 1 from information_schema.tables
              where table_schema='public' and table_name='support_vehicle')
     and not exists (select 1 from information_schema.columns
              where table_schema='public' and table_name='support_vehicle'
                and column_name='team_id') then
    alter table support_vehicle add column team_id uuid references team(id);
    create index if not exists idx_support_vehicle_team on support_vehicle(team_id);
  end if;
end$$;

-- Backfill all existing support_vehicle rows into Team Kabir.
do $$
declare
  v_team_id uuid;
begin
  select id into v_team_id from team where slug = 'kabir-raam-2026';
  if v_team_id is null then return; end if;
  update support_vehicle set team_id = v_team_id where team_id is null;
end$$;

-- =========================
-- Vehicle classification — what role each support vehicle plays
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'vehicle_kind') then
    create type vehicle_kind as enum (
      'follow',     -- primary support vehicle, the one allowed in restricted zones
      'leapfrog',   -- jumps ahead to stage handoffs (allowed daytime in many zones)
      'aux',        -- secondary support, takes alternate route in no-aux sections
      'rv',         -- crew sleep + supplies, takes alternate route
      'media'       -- press / film vehicle (rare for solo teams)
    );
  end if;
end$$;

alter table support_vehicle
  add column if not exists kind vehicle_kind not null default 'follow',
  add column if not exists active boolean not null default true;

-- =========================
-- vehicle_position — latest GPS pings per support vehicle
-- =========================
-- Distinct from gps_ping (which is rider-only). Crew phones + Garmin trackers
-- post here. Heaviest write table during the race so we keep it lean.
create table if not exists vehicle_position (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references team(id) on delete cascade,
  vehicle_id uuid not null references support_vehicle(id) on delete cascade,
  ping_at timestamptz not null default now(),
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  speed_mph numeric(5, 2),
  heading numeric(5, 2),
  source text default 'phone' check (source in ('phone','garmin','manual','raam_tracker')),
  driver_crew_id uuid references crew_member(id),
  navigator_crew_id uuid references crew_member(id),
  note text
);

create index if not exists idx_vehicle_position_vehicle_time
  on vehicle_position(vehicle_id, ping_at desc);
create index if not exists idx_vehicle_position_team_time
  on vehicle_position(team_id, ping_at desc);

-- =========================
-- stop_request — crew-initiated planned stops (AA6.1)
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'stop_reason') then
    create type stop_reason as enum (
      'loo',        -- bathroom break for crew
      'food',       -- food / coffee for crew
      'mech',       -- mechanical issue with rider's bike — fast-path
      'medical',    -- rider medical — fast-path
      'sleep',      -- sleep break (planned per sleep_block)
      'media',      -- press interview / photo
      'other'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'stop_status') then
    create type stop_status as enum ('pending', 'acknowledged', 'dispatched', 'cancelled');
  end if;
end$$;

create table if not exists stop_request (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references team(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Who asked for it.
  requested_by_crew_id uuid references crew_member(id),
  requested_by_label text,            -- denormalized so UI works even if crew row deleted
  -- What and how urgent.
  reason stop_reason not null,
  is_emergency boolean not null default false,
  -- 15-minute heads-up rule: dispatch_at = created_at + 15min unless emergency
  -- (mech / medical), in which case dispatch_at = created_at (immediate).
  dispatch_at timestamptz not null,
  notes text,
  -- Lifecycle.
  status stop_status not null default 'pending',
  rider_acknowledged_at timestamptz,
  dispatched_at timestamptz,
  cancelled_at timestamptz,
  cancelled_reason text
);

create index if not exists idx_stop_request_team_status
  on stop_request(team_id, status, dispatch_at);

-- =========================
-- RLS — match patterns from 0018_team_rls
-- =========================
alter table vehicle_position enable row level security;
alter table stop_request enable row level security;

-- Drop-then-recreate pattern (Supabase Postgres may predate "create policy if not exists").
drop policy if exists vehicle_position_team_read on vehicle_position;
create policy vehicle_position_team_read on vehicle_position
  for select using (
    exists (select 1 from team_member tm
             where tm.team_id = vehicle_position.team_id
               and tm.user_id = auth.uid())
  );

drop policy if exists vehicle_position_team_write on vehicle_position;
create policy vehicle_position_team_write on vehicle_position
  for all using (
    exists (select 1 from team_member tm
             where tm.team_id = vehicle_position.team_id
               and tm.user_id = auth.uid()
               and tm.role in ('owner','chief','crew','rider'))
  ) with check (
    exists (select 1 from team_member tm
             where tm.team_id = vehicle_position.team_id
               and tm.user_id = auth.uid()
               and tm.role in ('owner','chief','crew','rider'))
  );

drop policy if exists stop_request_team_read on stop_request;
create policy stop_request_team_read on stop_request
  for select using (
    exists (select 1 from team_member tm
             where tm.team_id = stop_request.team_id
               and tm.user_id = auth.uid())
  );

drop policy if exists stop_request_team_write on stop_request;
create policy stop_request_team_write on stop_request
  for all using (
    exists (select 1 from team_member tm
             where tm.team_id = stop_request.team_id
               and tm.user_id = auth.uid()
               and tm.role in ('owner','chief','crew','rider'))
  ) with check (
    exists (select 1 from team_member tm
             where tm.team_id = stop_request.team_id
               and tm.user_id = auth.uid()
               and tm.role in ('owner','chief','crew','rider'))
  );

-- =========================
-- Seed Team Kabir's two support vehicles if missing
-- =========================
do $$
declare
  v_team_id uuid;
  v_count int;
begin
  select id into v_team_id from team where slug = 'kabir-raam-2026';
  if v_team_id is null then return; end if;

  select count(*) into v_count from support_vehicle where team_id = v_team_id;
  if v_count = 0 then
    insert into support_vehicle (team_id, call_sign, category, kind, plate, notes)
    values
      (v_team_id, 'Follow-1',  'primary',   'follow',   null, 'Primary follow vehicle. Allowed in all restricted zones.'),
      (v_team_id, 'Leap-1',    'leapfrog',  'leapfrog', null, 'Leapfrog/aux vehicle. Takes alternate route in no-aux zones (TS6→9).');
  end if;
end$$;
