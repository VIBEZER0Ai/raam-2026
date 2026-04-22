-- Seed minimal crew emails so auth allowlist works.
-- Other crew emails to be populated via Admin UI (Step M) or SQL as they're confirmed.
update crew_member set email = 'vishal@zer0.ai' where full_name = 'Vishal Behal';
