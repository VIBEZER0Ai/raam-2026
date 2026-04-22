-- Whoop OAuth token storage + recovery snapshots.

create table if not exists whoop_token (
  id uuid primary key default gen_random_uuid(),
  crew_member_id uuid references crew_member(id) on delete cascade,
  whoop_user_id text not null,
  access_token text not null,
  refresh_token text not null,
  scope text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(crew_member_id, whoop_user_id)
);

create index if not exists idx_whoop_token_expires on whoop_token(expires_at);

create table if not exists whoop_recovery (
  id uuid primary key default gen_random_uuid(),
  crew_member_id uuid references crew_member(id) on delete cascade,
  cycle_id text not null,
  recovery_score int,
  resting_hr int,
  hrv_rmssd_ms numeric(6,2),
  spo2_pct numeric(5,2),
  skin_temp_c numeric(5,2),
  sleep_perf_pct numeric(5,2),
  created_at timestamptz not null default now(),
  score_state text,
  raw jsonb,
  unique(crew_member_id, cycle_id)
);

create index if not exists idx_whoop_recovery_crew_created
  on whoop_recovery(crew_member_id, created_at desc);

create table if not exists whoop_sleep (
  id uuid primary key default gen_random_uuid(),
  crew_member_id uuid references crew_member(id) on delete cascade,
  sleep_id text not null,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  nap boolean default false,
  total_sleep_min int,
  rem_sleep_min int,
  sws_min int,
  disturbance_count int,
  sleep_efficiency_pct numeric(5,2),
  respiratory_rate numeric(5,2),
  raw jsonb,
  unique(crew_member_id, sleep_id)
);

create index if not exists idx_whoop_sleep_crew_start
  on whoop_sleep(crew_member_id, start_ts desc);

alter table whoop_token enable row level security;
alter table whoop_recovery enable row level security;
alter table whoop_sleep enable row level security;

-- Authenticated read-only; writes only via service role.
create policy "whoop_token_read" on whoop_token for select
  to authenticated using (true);
create policy "whoop_recovery_read" on whoop_recovery for select
  to authenticated using (true);
create policy "whoop_sleep_read" on whoop_sleep for select
  to authenticated using (true);
