# Whoop integration

Auto-pulls Kabir's recovery + sleep from Whoop API v2 every 30 min. Feeds
the rule engine (low recovery → warn before race) and the readiness
widget on War Room.

## One-time setup (5 min, user action required)

1. Go to https://developer.whoop.com → **My Apps** → **Create App**.
2. Fields:
   - **Name:** `Team Kabir RAAM 2026`
   - **Contact email:** `vishal@zer0.ai`
   - **Privacy policy / ToS:** any URL you control (your portfolio OK)
   - **Redirect URIs:** `https://raam-2026.vercel.app/api/whoop/callback`
   - **Scopes:** `read:recovery read:sleep read:cycles read:profile offline`
3. Copy the **Client ID** + **Client Secret**.
4. Set in Vercel prod env + `.env.local`:
   ```
   WHOOP_CLIENT_ID=<id>
   WHOOP_CLIENT_SECRET=<secret>
   WHOOP_REDIRECT_URI=https://raam-2026.vercel.app/api/whoop/callback
   ```
5. Redeploy.

## Connect a user

1. Log in at `/login` as a crew member with a stored Whoop account
   (rider or crew chief).
2. Open `/admin/roster` → click the member row → **Connect Whoop →**.
3. Whoop consent page asks to share recovery/sleep → **Allow**.
4. Redirected back to `/admin/roster?whoop=connected`.
5. Initial 14-day backfill runs immediately; subsequent pulls every 30 min.

## Tables

- `whoop_token` — access + refresh per crew_member_id
- `whoop_recovery` — cycle-level recovery score, HRV, RHR, SpO2, skin temp
- `whoop_sleep` — each sleep event with stage breakdown

## Manual test

```bash
source .env.local
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://raam-2026.vercel.app/api/cron/whoop-sync
```

Returns `{tokens_checked, tokens_refreshed, recovery_upserted,
sleep_upserted, errors[]}`.

## Troubleshooting

- **`WHOOP_CLIENT_ID not configured`** — env vars missing in Vercel.
- **`whoop token exchange 401`** — client secret wrong, or redirect URI
  doesn't match what's registered on the Whoop app.
- **`state/nonce mismatch`** — user cookies disabled, or more than 10
  min elapsed between connect → callback. Retry.
- **Empty recovery list** — user hasn't synced their band in 14d, or
  scopes weren't granted. Have them reconnect.
