-- Chief-only RLS: crew_chief can edit all rows; other crew can edit self.
-- Non-crew authenticated users (rare) get read-only.

-- =========================
-- Helper functions
-- =========================
create or replace function current_crew_member_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  uemail text;
  cid uuid;
begin
  if uid is null then return null; end if;
  select email into uemail from auth.users where id = uid;
  select id into cid
    from crew_member c
   where c.active = true
     and (c.auth_user_id = uid or (uemail is not null and c.email = uemail))
   limit 1;
  return cid;
end$$;

create or replace function is_crew_chief()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  uemail text;
begin
  if uid is null then return false; end if;
  select email into uemail from auth.users where id = uid;
  return exists (
    select 1 from crew_member c
    where c.active = true
      and c.role = 'crew_chief'
      and (c.auth_user_id = uid or (uemail is not null and c.email = uemail))
  );
end$$;

grant execute on function current_crew_member_id() to authenticated;
grant execute on function is_crew_chief() to authenticated;

-- =========================
-- Auto-link auth.users → crew_member by email on signup
-- =========================
create or replace function public.link_crew_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update crew_member
     set auth_user_id = NEW.id
   where auth_user_id is null
     and email is not null
     and lower(email) = lower(NEW.email);
  return NEW;
end$$;

drop trigger if exists link_crew_on_signup on auth.users;
create trigger link_crew_on_signup
  after insert on auth.users
  for each row execute function public.link_crew_on_signup();

-- Backfill existing auth users (skip if another crew row already owns that auth id)
update crew_member c
   set auth_user_id = u.id
  from auth.users u
 where c.auth_user_id is null
   and c.email is not null
   and lower(c.email) = lower(u.email)
   and not exists (
     select 1 from crew_member c2 where c2.auth_user_id = u.id
   );

-- =========================
-- crew_member — chief CRUD all; self UPDATE own row
-- =========================
drop policy if exists "authenticated_insert_crew_member" on crew_member;
drop policy if exists "authenticated_update_crew_member" on crew_member;
drop policy if exists "public_read_crew_member" on crew_member;
drop policy if exists "chief_insert" on crew_member;
drop policy if exists "chief_or_self_update" on crew_member;
drop policy if exists "chief_delete" on crew_member;
drop policy if exists "crew_read" on crew_member;

create policy "crew_read" on crew_member for select
  to authenticated using (true);
create policy "chief_insert" on crew_member for insert
  to authenticated with check (is_crew_chief());
create policy "chief_or_self_update" on crew_member for update
  to authenticated
  using (is_crew_chief() or id = current_crew_member_id())
  with check (is_crew_chief() or id = current_crew_member_id());
create policy "chief_delete" on crew_member for delete
  to authenticated using (is_crew_chief());

-- =========================
-- Strategy / reference tables — chief-only mutate, authenticated read
-- =========================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'target_plan', 'penalty_policy', 'rule',
    'sleep_block', 'night_window', 'critical_segment',
    'time_station', 'race_protocol'
  ]) loop
    -- Skip if table doesn't exist (some projects may not have all)
    if not exists (select 1 from information_schema.tables
                    where table_schema='public' and table_name=t) then
      continue;
    end if;

    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public_read_%1$s" on %1$s', t);
    execute format('drop policy if exists "authenticated_read_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_write_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_update_%1$s" on %1$s', t);
    execute format('drop policy if exists "chief_delete_%1$s" on %1$s', t);

    execute format(
      'create policy "authenticated_read_%1$s" on %1$s for select to authenticated using (true)',
      t
    );
    execute format(
      'create policy "chief_write_%1$s" on %1$s for insert to authenticated with check (is_crew_chief())',
      t
    );
    execute format(
      'create policy "chief_update_%1$s" on %1$s for update to authenticated using (is_crew_chief()) with check (is_crew_chief())',
      t
    );
    execute format(
      'create policy "chief_delete_%1$s" on %1$s for delete to authenticated using (is_crew_chief())',
      t
    );
  end loop;
end$$;

-- =========================
-- Logs that any crew can write (nutrition, rest, comms) — keep open for authenticated
-- but DELETE now chief-only (avoid accidental crew nuking history).
-- =========================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'nutrition_log', 'rest_log', 'comms_log', 'alert', 'social_post'
  ]) loop
    if not exists (select 1 from information_schema.tables
                    where table_schema='public' and table_name=t) then
      continue;
    end if;
    execute format('drop policy if exists "chief_delete_%1$s" on %1$s', t);
    execute format(
      'create policy "chief_delete_%1$s" on %1$s for delete to authenticated using (is_crew_chief())',
      t
    );
  end loop;
end$$;
