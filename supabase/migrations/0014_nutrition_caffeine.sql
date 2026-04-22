-- Add caffeine tracking to nutrition_log (UI already has a caffeine button).
alter table nutrition_log
  add column if not exists caffeine_mg numeric(6,1) default 0;

create index if not exists idx_nutrition_log_time
  on nutrition_log(logged_at desc);
