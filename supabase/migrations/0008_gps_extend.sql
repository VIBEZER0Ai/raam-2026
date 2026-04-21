-- Extend gps_ping for engine derivation: mile_from_start + state + device_id.
-- Adds RLS policies for public read + insert (demo).
-- TODO: tighten insert policy to authenticated service role once API keys set.

alter table gps_ping
  add column if not exists mile_from_start numeric(8,2),
  add column if not exists state text,
  add column if not exists device_id text,
  add column if not exists note text;

create index if not exists idx_gps_ping_mile on gps_ping(mile_from_start);

alter table gps_ping enable row level security;

create policy "public_read_gps_ping" on gps_ping
  for select using (true);

create policy "public_insert_gps_ping" on gps_ping
  for insert with check (true);
