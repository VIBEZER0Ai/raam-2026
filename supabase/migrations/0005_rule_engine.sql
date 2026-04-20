-- RAAM 2026 Rule Compliance Engine
-- Catalog + evaluation log. Feeds /compliance screen and War Room alerts.

create type rule_category as enum (
  'time',        -- TS check-ins, cutoffs, race clock
  'night',       -- night protocol, 30ft follow, leapfrog ban
  'geo',         -- regional rules (AZ/UT/CO), shuttles
  'safety',      -- reflective, lights, helmets
  'support',     -- vehicle ops, caravanning, 2-min impede
  'racer',       -- headphones, drafting, adjustments
  'penalty',     -- DQ triggers, penalty tracking
  'nutrition',   -- feed window, sodium, deficit (team strategy)
  'sleep'        -- 90-min rule, Shermer's, mandatory sleeps
);

create type rule_kind as enum (
  'prohibit',    -- "must not" — violation = penalty
  'require',     -- "must" — missing = penalty
  'monitor',     -- informational, crew awareness
  'trigger'      -- fires protocol (sleep, forced rest)
);

create table if not exists rule (
  code        text primary key,             -- e.g. "1460_NIGHT_DIRECT_FOLLOW"
  category    rule_category not null,
  kind        rule_kind not null,
  severity    alert_severity not null,
  name        text not null,
  description text not null,
  source_ref  text,                         -- "Rule 1460", "Strategy Report p.4"
  dq_trigger  boolean default false,        -- true = this violation can DQ
  sort_order  int default 0
);
alter table rule enable row level security;
create policy "public_read_rule" on rule for select using (true);

create table if not exists rule_evaluation (
  id           uuid primary key default gen_random_uuid(),
  rule_code    text not null references rule(code),
  fired_at     timestamptz not null default now(),
  context      jsonb not null default '{}',    -- speed, mile, ts, crew, etc
  status       alert_status not null default 'open',
  ack_by       uuid references crew_member(id),
  ack_at       timestamptz,
  penalty_id   uuid references penalty(id),
  notes        text
);
alter table rule_evaluation enable row level security;
create policy "public_read_rule_evaluation" on rule_evaluation for select using (true);

create index if not exists idx_rule_evaluation_open
  on rule_evaluation(status, fired_at desc);
create index if not exists idx_rule_evaluation_code
  on rule_evaluation(rule_code, fired_at desc);
