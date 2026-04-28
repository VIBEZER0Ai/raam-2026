-- 0021_team_units.sql
-- Per-team units preference. Race + route-book data stays in imperial (RAAM is a
-- US race, official mile markers are imperial), but the app converts on display.
-- Default 'imperial' so existing Team Kabir behavior is unchanged on rollout.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'units_pref') then
    create type units_pref as enum ('imperial', 'metric');
  end if;
end$$;

alter table team
  add column if not exists units units_pref not null default 'imperial';

-- Team Kabir (Indian crew + rider) defaults to metric per call 2026-04-27.
update team set units = 'metric'
 where slug = 'kabir-raam-2026';
