-- RAAM 2026 · RLS tightening — lock down mutating ops to authenticated users.
-- Public reads remain on reference tables (spectator needs them).
-- Anon ingest route (POST /api/gps/ping) uses INGEST_SECRET header check in app,
-- and the API route uses service_role client (bypasses RLS) when secret matches.

-- =========================
-- penalty — was public insert/update; now authenticated-only
-- =========================
drop policy if exists "public_insert_penalty" on penalty;
drop policy if exists "public_update_penalty" on penalty;

create policy "authenticated_insert_penalty" on penalty
  for insert to authenticated with check (true);

create policy "authenticated_update_penalty" on penalty
  for update to authenticated using (true) with check (true);

-- public read stays (read access to ledger for spectator? No — remove)
drop policy if exists "public_read_penalty" on penalty;
create policy "authenticated_read_penalty" on penalty
  for select to authenticated using (true);

-- =========================
-- gps_ping — reads stay public (spectator + family tracker)
-- inserts require authentication
-- =========================
drop policy if exists "public_insert_gps_ping" on gps_ping;

create policy "authenticated_insert_gps_ping" on gps_ping
  for insert to authenticated with check (true);

-- =========================
-- crew_member — any authenticated user may CRUD (tighten by role in next step)
-- =========================
drop policy if exists "public_insert_crew_member" on crew_member;
drop policy if exists "public_update_crew_member" on crew_member;

create policy "authenticated_insert_crew_member" on crew_member
  for insert to authenticated with check (true);

create policy "authenticated_update_crew_member" on crew_member
  for update to authenticated using (true) with check (true);

-- =========================
-- rule_evaluation — crew only
-- =========================
drop policy if exists "public_read_rule_evaluation" on rule_evaluation;

create policy "authenticated_read_rule_evaluation" on rule_evaluation
  for select to authenticated using (true);

create policy "authenticated_insert_rule_evaluation" on rule_evaluation
  for insert to authenticated with check (true);

-- =========================
-- Other already-RLS-enabled tables (nutrition_log, rest_log, crew_shift, alert,
-- comms_log, social_post) — add authenticated insert/read
-- =========================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'nutrition_log', 'rest_log', 'crew_shift', 'alert',
    'comms_log', 'social_post'
  ]) loop
    execute format('drop policy if exists "authenticated_read_%1$s" on %1$s', t);
    execute format('drop policy if exists "authenticated_write_%1$s" on %1$s', t);
    execute format(
      'create policy "authenticated_read_%1$s" on %1$s for select to authenticated using (true)',
      t
    );
    execute format(
      'create policy "authenticated_write_%1$s" on %1$s for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end$$;
