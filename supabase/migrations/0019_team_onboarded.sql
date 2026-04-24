-- Track onboarding completion per team so the wizard shows only once.
alter table team
  add column if not exists onboarded_at timestamptz;

-- Retroactively mark Team Kabir as onboarded (this team was seeded manually).
update team set onboarded_at = now()
 where slug = 'kabir-raam-2026' and onboarded_at is null;
