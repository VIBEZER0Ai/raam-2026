-- 0018 · Team-scoped RLS on all operational tables.
--
-- Goal: every operational row is readable/writable only by members of
-- the team_id on that row (or by platform admins).
-- Exceptions (public reads preserved for spectator + landing):
--   - gps_ping                (tracker uses this)
--   - time_station            (spectator needs course info)
--   - target_plan             (spectator needs targets)
--   - race_protocol           (spectator needs cutoffs)
--   - critical_segment, night_window (spectator viz)
--
-- Writes via anon ingest endpoints (/api/gps/ping, /api/cron/*) go
-- through the service_role client in API routes — those bypass RLS,
-- so no special policy is needed.

-- Helper: does a row's team_id match any of my teams?
create or replace function can_read_team(p_team_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_team_id is null                         -- legacy rows with no team_id readable by everyone until backfilled
      or p_team_id in (select current_team_ids()); -- user's teams
$$;
grant execute on function can_read_team(uuid) to authenticated, anon;

-- =========================
-- Tables with PUBLIC read preserved (+ add team-scoped write)
-- =========================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'gps_ping', 'time_station', 'target_plan',
    'race_protocol', 'critical_segment', 'night_window'
  ]) loop
    if not exists (select 1 from information_schema.tables
                    where table_schema='public' and table_name=t) then
      continue;
    end if;
    execute format('alter table %I enable row level security', t);
    -- Keep whatever public read policies already exist (spectator relies on them).
    -- Drop old authenticated-insert / chief-write policies we are replacing
    execute format('drop policy if exists "authenticated_insert_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_write_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_update_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_delete_%1$s" on %1$s', t);
    execute format('drop policy if exists "team_insert_%1$s" on %1$s', t);
    execute format('drop policy if exists "team_update_%1$s" on %1$s', t);
    execute format('drop policy if exists "team_delete_%1$s" on %1$s', t);

    execute format(
      'create policy "team_insert_%1$s" on %1$s for insert to authenticated
         with check (team_id is null or is_team_member(team_id))',
      t
    );
    execute format(
      'create policy "team_update_%1$s" on %1$s for update to authenticated
         using (team_id is null or is_team_member(team_id))
         with check (team_id is null or is_team_member(team_id))',
      t
    );
    execute format(
      'create policy "team_delete_%1$s" on %1$s for delete to authenticated
         using (team_id is not null and is_team_chief(team_id))',
      t
    );
  end loop;
end$$;

-- =========================
-- Tables with TEAM-ONLY read + write (no public access)
-- =========================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'crew_member', 'nutrition_log', 'rest_log',
    'rule_evaluation', 'sleep_block', 'penalty',
    'whoop_token', 'whoop_recovery', 'whoop_sleep',
    'comms_log', 'alert', 'crew_shift', 'social_post',
    'gps_ping_matched'
  ]) loop
    if not exists (select 1 from information_schema.tables
                    where table_schema='public' and table_name=t) then
      continue;
    end if;
    execute format('alter table %I enable row level security', t);

    -- Drop the older chief-style policies from 0016
    execute format('drop policy if exists "crew_read" on %I', t);
    execute format('drop policy if exists "chief_insert" on %I', t);
    execute format('drop policy if exists "chief_or_self_update" on %I', t);
    execute format('drop policy if exists "chief_delete" on %I', t);
    execute format('drop policy if exists "authenticated_read_%1$s" on %1$s', t);
    execute format('drop policy if exists "authenticated_write_%1$s" on %1$s', t);
    execute format('drop policy if exists "authenticated_insert_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_write_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_update_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_delete_%1$s" on %1$s', t);
    execute format('drop policy if exists "whoop_token_read" on %I', t);
    execute format('drop policy if exists "whoop_recovery_read" on %I', t);
    execute format('drop policy if exists "whoop_sleep_read" on %I', t);
    execute format('drop policy if exists "team_read_%1$s" on %1$s', t);
    execute format('drop policy if exists "team_insert_%1$s" on %1$s', t);
    execute format('drop policy if exists "team_update_%1$s" on %1$s', t);
    execute format('drop policy if exists "team_delete_%1$s" on %1$s', t);

    execute format(
      'create policy "team_read_%1$s" on %1$s for select to authenticated
         using (can_read_team(team_id))',
      t
    );
    execute format(
      'create policy "team_insert_%1$s" on %1$s for insert to authenticated
         with check (team_id is null or is_team_member(team_id))',
      t
    );
    execute format(
      'create policy "team_update_%1$s" on %1$s for update to authenticated
         using (can_read_team(team_id))
         with check (team_id is null or is_team_member(team_id))',
      t
    );
    execute format(
      'create policy "team_delete_%1$s" on %1$s for delete to authenticated
         using (team_id is not null and is_team_chief(team_id))',
      t
    );
  end loop;
end$$;

-- =========================
-- crew_member special case: self-update of own row
-- =========================
drop policy if exists "team_update_crew_member" on crew_member;
create policy "team_update_crew_member" on crew_member for update to authenticated
  using (
    can_read_team(team_id)
    and (
      is_team_chief(team_id)
      or id = current_crew_member_id()
    )
  )
  with check (
    can_read_team(team_id)
    and (
      is_team_chief(team_id)
      or id = current_crew_member_id()
    )
  );

-- =========================
-- Rule table — read by team member, only platform admin or chief writes
-- (rules can be team-shared library in future)
-- =========================
do $$
begin
  if exists (select 1 from information_schema.tables
              where table_schema='public' and table_name='rule') then
    alter table rule enable row level security;
    drop policy if exists "authenticated_read_rule" on rule;
    drop policy if exists "chief_write_rule" on rule;
    drop policy if exists "chief_update_rule" on rule;
    drop policy if exists "chief_delete_rule" on rule;

    create policy "rule_read" on rule for select to authenticated using (true);
    create policy "rule_write" on rule for insert to authenticated
      with check (is_platform_admin());
    create policy "rule_update" on rule for update to authenticated
      using (is_platform_admin()) with check (is_platform_admin());
    create policy "rule_delete" on rule for delete to authenticated
      using (is_platform_admin());
  end if;
end$$;
