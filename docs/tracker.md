# RAAM official tracker

Pulls Kabir's live position from the RAAM 2026 tracker and forwards it to
`/api/gps/ping`, which runs Map Matching, mile lookup, and the rule engine.

## Runtime

- `src/lib/raam/tracker.ts` — adapter dispatch + fetch + dedup + forward
- `src/app/api/cron/tracker/route.ts` — scheduled GET (Bearer CRON_SECRET)
- `.github/workflows/cron-tracker.yml` — fires every 5 minutes on GitHub
  Actions free tier

## Activate

Default `RAAM_TRACKER_ADAPTER=disabled` — the cron runs but returns
`{disabled: true}` until configured.

When RAAM publishes the 2026 live URL (expected days before race start),
set env vars in Vercel + `.env.local`:

```
RAAM_TRACKER_ADAPTER=generic_json
RAAM_TRACKER_URL=<the published URL>
RAAM_RACER_NUMBER=610
RAAM_TRACKER_LAT_PATH=<dot path to lat in response>
RAAM_TRACKER_LNG_PATH=<dot path to lng>
RAAM_TRACKER_SPEED_PATH=<optional>
RAAM_TRACKER_MILE_PATH=<optional>
```

Adapter options:
| adapter | source | config |
|---|---|---|
| `disabled` | n/a | default — cron no-op |
| `generic_json` | JSON endpoint | dot-path mappings above |
| `leaderboard` | HTML leaderboard on raceacrossamerica.org | racer number only; regex heuristics |

## Dedup

Tracker writes to `gps_ping` only when position has moved ≥ ~10 meters
from the last stored row. Otherwise returns without inserting.

## Manual test

```bash
source .env.local
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://raam-2026.vercel.app/api/cron/tracker
```

Returns `{ran_at, ok, adapter, disabled?, position?, inserted?, engine?}`.

## Troubleshooting

- **Always `disabled: true`** — set `RAAM_TRACKER_ADAPTER` to `generic_json`
  or `leaderboard` in Vercel env + redeploy.
- **`lat/lng missing`** — the dot paths are wrong for the actual feed.
  `curl $RAAM_TRACKER_URL | jq` to inspect structure, then fix paths.
- **Leaderboard regex fails** — update the heuristics in `runLeaderboard`
  once the 2026 HTML layout is known.
- **`forward failed` / `INGEST_SECRET missing`** — ensure `INGEST_SECRET`
  is set in Vercel prod and matches what the tracker uses.
