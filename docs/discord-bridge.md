# Discord bridge

Two directions. Both optional — dashboard works without them.

## Inbound — RAAM HQ → our comms_log

Goal: whenever RAAM staff post in the official Discord server, mirror
the message into our `comms_log` table so `/comms` shows it live.

The RAAM Discord server is run by RAAM, not by us. We can't install
webhooks inside their server. Workaround: run a small **relay bot** on
a machine under our control that's a member of the server. The bot
listens for messages and forwards them to our endpoint.

### Endpoint

```
POST https://raam-2026.vercel.app/api/discord/inbound
  x-discord-secret: <DISCORD_INBOUND_SECRET>
  content-type:     application/json
```

Body (`DiscordInboundPayload`):

```json
{
  "channel": "#race-announcements",
  "author": "RAAM HQ",
  "content": "Weather hold called at TS14...",
  "ts_iso": "2026-06-18T14:22:00Z",
  "message_id": "1182739281029384",
  "server": "RAAM HQ"
}
```

`message_id` is optional but recommended — the endpoint deduplicates
on it, so replaying doesn't produce duplicate log rows.

### Minimal relay (discord.js + a $5/mo VPS)

```js
// relay.js — run with `node relay.js`
import { Client, GatewayIntentBits } from "discord.js";

const DEST = "https://raam-2026.vercel.app/api/discord/inbound";
const SECRET = process.env.DISCORD_INBOUND_SECRET;
const WATCH_CHANNELS = (process.env.WATCH_CHANNELS ?? "").split(",");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

bot.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (WATCH_CHANNELS.length && !WATCH_CHANNELS.includes(msg.channel.id)) return;
  try {
    await fetch(DEST, {
      method: "POST",
      headers: { "content-type": "application/json", "x-discord-secret": SECRET },
      body: JSON.stringify({
        channel: `#${msg.channel.name}`,
        author: msg.member?.displayName ?? msg.author.username,
        content: msg.content,
        ts_iso: msg.createdAt.toISOString(),
        message_id: msg.id,
        server: msg.guild?.name ?? "unknown",
      }),
    });
  } catch (e) {
    console.error("relay failed", e);
  }
});

bot.login(process.env.DISCORD_BOT_TOKEN);
```

Steps:
1. Discord developer portal → New Application → add **Bot** → copy token
2. Generate invite link with scopes `bot` + permission `Read Messages`
3. Ask a RAAM server admin to invite the bot (link them the invite URL)
4. Get the channel IDs to watch (right-click channel → Copy Channel ID
   with Developer Mode on)
5. Deploy the relay anywhere — Fly.io, Railway, Hetzner, even a laptop

### Simpler fallback — manual paste

If the bot route is too heavy for race week, a designated crew member
can paste the message into `/comms` manually (TODO: build this form).

## Outbound — our alerts → crew Discord channel

Create a normal webhook in **your** Discord server (not RAAM's):
- Settings → Integrations → Webhooks → New Webhook
- Copy the webhook URL
- Paste into `.env.local` as `DISCORD_WEBHOOK_URL`

Server code that calls `sendDiscordMessage({...})` will post to that
channel. SOS triggers `@here`; other kinds stay quiet.

## Environment variables

```
DISCORD_INBOUND_SECRET=<long-random-string>  # inbound endpoint auth
DISCORD_WEBHOOK_URL=<crew-channel-webhook>   # outbound alerts
```

Both added to `.env.local.example`.
