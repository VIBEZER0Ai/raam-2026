-- Ventor multi-tenancy foundation — every operational table scoped by team_id.
-- Team Kabir becomes team_id of the existing data. Future teams sign up
-- via /signup and get fresh scoped rows from an event_template.

-- =========================
-- Core tables
-- =========================

create table if not exists event_template (
  code text primary key,
  name text not null,
  sport text not null check (sport in ('cycling','running','triathlon','bikepacking','multi','other')),
  discipline text check (discipline in ('crewed','unsupported','semi-supported','solo')),
  total_miles numeric(7,2),
  total_km numeric(7,2),
  notes text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists team (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  name text not null,
  sport text not null,
  event_code text references event_template(code),
  race_start_at timestamptz,
  race_end_at timestamptz,
  timezone text default 'America/Los_Angeles',
  plan text not null default 'free' check (plan in ('free','pro','team')),
  billing_customer_id text,
  owner_user_id uuid references auth.users(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_team_slug on team(slug);

create table if not exists team_member (
  team_id uuid not null references team(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'crew' check (role in ('owner','chief','crew','observer','rider')),
  crew_member_id uuid references crew_member(id) on delete set null,
  invited_by uuid references auth.users(id),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index if not exists idx_team_member_user on team_member(user_id);
create index if not exists idx_team_member_team_role on team_member(team_id, role);

-- Optional platform-wide super admin flag (you = super admin for support)
create table if not exists platform_admin (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

-- =========================
-- Seed event templates
-- =========================
insert into event_template (code, name, sport, discipline, total_miles, total_km, notes)
values
  ('raam_2026',        'Race Across America 2026',          'cycling',     'crewed',         3087, 4968,  'Oceanside CA → Annapolis MD'),
  ('raam_2025',        'Race Across America 2025',          'cycling',     'crewed',         3088, 4969,  'historic — for debrief imports'),
  ('tcr_2026',         'Transcontinental Race 2026',        'bikepacking', 'unsupported',    null, 4000,  'route varies yearly'),
  ('badwater_2026',    'Badwater 135',                      'running',     'crewed',         135, 217,   'Death Valley → Mt Whitney'),
  ('utmb_2026',        'UTMB',                              'running',     'semi-supported', 106, 171,   'Chamonix loop'),
  ('ironman_140',      'Ironman 140.6',                     'triathlon',   'crewed',         140.6, 226, 'swim 2.4 / bike 112 / run 26.2'),
  ('ironman_70',       'Ironman 70.3',                      'triathlon',   'crewed',         70.3, 113,  'half ironman'),
  ('spartathlon_2026', 'Spartathlon 2026',                  'running',     'crewed',         152, 246,   'Athens → Sparta'),
  ('generic_ultra',    'Custom ultra event',                'other',       'solo',           null, null,  'blank template')
on conflict (code) do nothing;

-- =========================
-- Create Team Kabir and backfill
-- =========================
insert into team (slug, name, sport, event_code, race_start_at, timezone)
values (
  'kabir-raam-2026',
  'Team Kabir · RAAM 2026',
  'cycling',
  'raam_2026',
  '2026-06-16 12:00:00-07:00',
  'America/Los_Angeles'
)
on conflict (slug) do nothing;

-- Set Vishal (auth user) as owner + platform admin
do $$
declare
  v_team_id uuid;
  v_vishal_uid uuid;
begin
  select id into v_team_id from team where slug = 'kabir-raam-2026';
  select id into v_vishal_uid from auth.users where lower(email) = 'vishal@zer0.ai' limit 1;

  if v_team_id is not null and v_vishal_uid is not null then
    update team set owner_user_id = v_vishal_uid
     where id = v_team_id and owner_user_id is null;

    insert into platform_admin (user_id)
      values (v_vishal_uid)
      on conflict (user_id) do nothing;

    insert into team_member (team_id, user_id, role, crew_member_id)
    select v_team_id, v_vishal_uid, 'owner', c.id
      from crew_member c where lower(c.email) = 'vishal@zer0.ai' limit 1
    on conflict (team_id, user_id) do nothing;
  end if;
end$$;

-- =========================
-- Add team_id to operational tables (nullable; backfill; not-null-ify)
-- =========================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'crew_member', 'gps_ping', 'gps_ping_matched',
    'nutrition_log', 'rest_log', 'rule_evaluation',
    'time_station', 'target_plan', 'sleep_block',
    'night_window', 'critical_segment', 'race_protocol',
    'penalty', 'whoop_token', 'whoop_recovery', 'whoop_sleep',
    'comms_log', 'alert', 'crew_shift', 'social_post'
  ]) loop
    if not exists (select 1 from information_schema.tables
                    where table_schema='public' and table_name=t) then
      continue;
    end if;
    if not exists (select 1 from information_schema.columns
                    where table_schema='public' and table_name=t
                      and column_name='team_id') then
      execute format('alter table %I add column team_id uuid references team(id)', t);
      execute format('create index if not exists idx_%1$s_team on %1$s(team_id)', t);
    end if;
  end loop;
end$$;

-- Backfill every existing row into Team Kabir
do $$
declare
  v_team_id uuid;
  t text;
begin
  select id into v_team_id from team where slug = 'kabir-raam-2026';
  if v_team_id is null then return; end if;

  for t in select unnest(array[
    'crew_member', 'gps_ping', 'gps_ping_matched',
    'nutrition_log', 'rest_log', 'rule_evaluation',
    'time_station', 'target_plan', 'sleep_block',
    'night_window', 'critical_segment', 'race_protocol',
    'penalty', 'whoop_token', 'whoop_recovery', 'whoop_sleep',
    'comms_log', 'alert', 'crew_shift', 'social_post'
  ]) loop
    if not exists (select 1 from information_schema.tables
                    where table_schema='public' and table_name=t) then
      continue;
    end if;
    execute format(
      'update %I set team_id = $1 where team_id is null',
      t
    ) using v_team_id;
  end loop;
end$$;

-- Link every active crew_member's team_member row (if they have an auth user)
insert into team_member (team_id, user_id, role, crew_member_id)
select
  (select id from team where slug = 'kabir-raam-2026'),
  c.auth_user_id,
  case when c.role = 'crew_chief' then 'chief'
       when c.role = 'rider' then 'rider'
       else 'crew' end,
  c.id
from crew_member c
where c.auth_user_id is not null
on conflict (team_id, user_id) do update
  set crew_member_id = excluded.crew_member_id;

-- =========================
-- Helper functions (team-aware)
-- =========================
create or replace function is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from platform_admin where user_id = auth.uid());
$$;

create or replace function current_team_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select team_id from team_member where user_id = auth.uid()
  union
  select id from team where is_platform_admin();  -- admins see all
$$;

create or replace function is_team_chief(p_team_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from team_member
    where team_id = p_team_id
      and user_id = auth.uid()
      and role in ('owner','chief')
  ) or is_platform_admin();
$$;

create or replace function is_team_member(p_team_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from team_member
    where team_id = p_team_id and user_id = auth.uid()
  ) or is_platform_admin();
$$;

grant execute on function is_platform_admin() to authenticated;
grant execute on function current_team_ids() to authenticated;
grant execute on function is_team_chief(uuid) to authenticated;
grant execute on function is_team_member(uuid) to authenticated;

-- =========================
-- Enable RLS on new tables (read by team members, write by chiefs)
-- =========================
alter table team enable row level security;
alter table team_member enable row level security;
alter table event_template enable row level security;

drop policy if exists "team_read" on team;
drop policy if exists "team_update" on team;
create policy "team_read" on team for select to authenticated
  using (id in (select current_team_ids()));
create policy "team_update" on team for update to authenticated
  using (is_team_chief(id))
  with check (is_team_chief(id));

drop policy if exists "team_member_read" on team_member;
drop policy if exists "team_member_write" on team_member;
create policy "team_member_read" on team_member for select to authenticated
  using (team_id in (select current_team_ids()));
create policy "team_member_write" on team_member for all to authenticated
  using (is_team_chief(team_id))
  with check (is_team_chief(team_id));

drop policy if exists "event_template_read" on event_template;
create policy "event_template_read" on event_template for select
  to authenticated using (true);
