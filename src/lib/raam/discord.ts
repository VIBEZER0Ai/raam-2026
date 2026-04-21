/**
 * Discord bridge helpers.
 *
 * Inbound — RAAM HQ server messages forwarded to our Supabase via
 * POST /api/discord/inbound. Relay runs outside this app (see docs).
 *
 * Outbound — post alerts + SOS broadcasts to our own crew Discord channel
 * via a server-only webhook URL (DISCORD_WEBHOOK_URL env).
 */

export type DiscordPingKind = "alert" | "sos" | "milestone" | "info";

const ICON_BY_KIND: Record<DiscordPingKind, string> = {
  alert: "🟠",
  sos: "🚨",
  milestone: "🏁",
  info: "ℹ️",
};

export interface SendDiscordInput {
  kind: DiscordPingKind;
  title: string;
  body?: string;
  url?: string; // override webhook URL per call (e.g., SOS-specific channel)
}

/**
 * POST a message to a Discord channel via incoming webhook.
 * Non-fatal — returns ok:false on failure, caller decides whether to alert.
 */
export async function sendDiscordMessage(
  input: SendDiscordInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const webhookUrl = input.url ?? process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: false, error: "DISCORD_WEBHOOK_URL not set" };
  }
  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return { ok: false, error: "Webhook URL must be Discord webhook URL" };
  }

  const icon = ICON_BY_KIND[input.kind];
  const content =
    input.kind === "sos"
      ? `@here ${icon} **SOS** — ${input.title}${input.body ? `\n${input.body}` : ""}`
      : `${icon} **${input.title}**${input.body ? `\n${input.body}` : ""}`;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content,
        allowed_mentions:
          input.kind === "sos"
            ? { parse: ["everyone"] }
            : { parse: [] },
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Discord webhook ${res.status}: ${txt.slice(0, 120)}`,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Shape accepted by POST /api/discord/inbound. */
export interface DiscordInboundPayload {
  channel: string; // e.g. "#race-announcements"
  author: string; // display name
  content: string; // message body
  ts_iso?: string; // event time; defaults to server now
  message_id?: string; // Discord message ID for idempotence
  server?: string; // "RAAM HQ" — defaults to "RAAM HQ"
}
