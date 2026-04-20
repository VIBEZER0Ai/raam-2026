-- Enable public read for penalty ledger display.
-- Insert policy allows any authenticated (or anon for demo) write.
-- TODO: tighten when auth wired — limit inserts to crew_chief + cc_operator roles.

create policy "public_read_penalty" on penalty
  for select using (true);

create policy "public_insert_penalty" on penalty
  for insert with check (true);

create policy "public_update_penalty" on penalty
  for update using (true) with check (true);
