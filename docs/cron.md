# Rule-engine cron

Runs `/api/cron/engine` every 5 minutes so time-based rules fire even when no
GPS pings are arriving (race paused, tracker offline, crew resting).

## Default: GitHub Actions (free)

`.github/workflows/cron-engine.yml` posts to the production endpoint on the
`*/5 * * * *` schedule.

Requires:
- Repo secret `CRON_SECRET` (generated and already set in this repo)
- `CRON_SECRET` env var in Vercel production (also set)

Check runs here: https://github.com/VIBEZER0Ai/raam-2026/actions/workflows/cron-engine.yml

## Upgrade path: Vercel Cron (Pro plan)

Vercel Hobby blocks sub-daily schedules. On Pro, add this to `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/engine", "schedule": "*/5 * * * *" }
  ]
}
```

Then disable the GitHub Actions workflow (or keep both — the endpoint is
idempotent thanks to the 15 min dedup window in the rule-runner).

## Manual hit

```bash
source .env.local
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://raam-2026.vercel.app/api/cron/engine
```

Returns a `RunnerSummary` JSON with evaluated / persisted / discord counts.
