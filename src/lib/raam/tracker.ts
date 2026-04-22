/**
 * RAAM official tracker fetcher.
 *
 * RAAM 2026 will publish live racer positions via raceacrossamerica.org.
 * The exact URL and format are not public until days before race start, so
 * this module keeps the fetcher behind a configurable adapter switch:
 *
 *   RAAM_TRACKER_ADAPTER=disabled      — no-op (default pre-race)
 *   RAAM_TRACKER_ADAPTER=generic_json  — GET JSON, map fields via env vars
 *   RAAM_TRACKER_ADAPTER=leaderboard   — parse RAAM HTML leaderboard
 *
 * Common env:
 *   RAAM_TRACKER_URL        — the feed or page URL
 *   RAAM_RACER_NUMBER       — 610 (Kabir). Used to find our rider in multi-row feeds.
 *   RAAM_TRACKER_USER_AGENT — override fetch UA (some sites block bots)
 *
 * Adapter-specific (generic_json only):
 *   RAAM_TRACKER_LAT_PATH    — dot path to lat, e.g. "racer.position.lat"
 *   RAAM_TRACKER_LNG_PATH    — dot path to lng
 *   RAAM_TRACKER_SPEED_PATH  — optional dot path to speed mph
 *   RAAM_TRACKER_MILE_PATH   — optional dot path to mile_from_start
 *
 * Writes to gps_ping via the normal /api/gps/ping endpoint using INGEST_SECRET,
 * so all downstream processing (Map Matching, mile lookup, engine run) fires
 * exactly as it would for a manual ping.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export interface FetchResult {
  ok: boolean;
  disabled?: boolean;
  adapter: string;
  note?: string;
  /** Latest position pulled, if any. */
  position?: {
    lat: number;
    lng: number;
    speed_mph?: number;
    mile_from_start?: number;
    fetched_at: string;
  };
  /** Whether we inserted a new gps_ping row. */
  inserted?: boolean;
  /** Engine summary from the POST response if inserted. */
  engine?: unknown;
  error?: string;
}

function getenv(k: string): string | null {
  const v = process.env[k];
  return v && v.trim() ? v.trim() : null;
}

function dotPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

/** Adapter: disabled — returns early, no fetch. */
async function runDisabled(): Promise<FetchResult> {
  return {
    ok: true,
    disabled: true,
    adapter: "disabled",
    note:
      "Set RAAM_TRACKER_ADAPTER + RAAM_TRACKER_URL to enable scraping. " +
      "See docs/tracker.md.",
  };
}

/** Adapter: generic_json — fetch JSON, pluck lat/lng via dot paths. */
async function runGenericJson(url: string): Promise<FetchResult> {
  const latPath = getenv("RAAM_TRACKER_LAT_PATH") ?? "lat";
  const lngPath = getenv("RAAM_TRACKER_LNG_PATH") ?? "lng";
  const speedPath = getenv("RAAM_TRACKER_SPEED_PATH");
  const milePath = getenv("RAAM_TRACKER_MILE_PATH");
  const ua =
    getenv("RAAM_TRACKER_USER_AGENT") ??
    "Mozilla/5.0 (compatible; TeamKabirBot/1.0; +https://raam-2026.vercel.app)";

  let json: unknown;
  try {
    const res = await fetch(url, { headers: { "user-agent": ua } });
    if (!res.ok) {
      return {
        ok: false,
        adapter: "generic_json",
        error: `HTTP ${res.status}`,
      };
    }
    json = await res.json();
  } catch (e) {
    return {
      ok: false,
      adapter: "generic_json",
      error: e instanceof Error ? e.message : String(e),
    };
  }

  const lat = Number(dotPath(json, latPath));
  const lng = Number(dotPath(json, lngPath));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      ok: false,
      adapter: "generic_json",
      error: `lat/lng missing at paths ${latPath} / ${lngPath}`,
    };
  }
  const speed = speedPath ? Number(dotPath(json, speedPath)) : NaN;
  const mile = milePath ? Number(dotPath(json, milePath)) : NaN;

  return {
    ok: true,
    adapter: "generic_json",
    position: {
      lat,
      lng,
      speed_mph: Number.isFinite(speed) ? speed : undefined,
      mile_from_start: Number.isFinite(mile) ? mile : undefined,
      fetched_at: new Date().toISOString(),
    },
  };
}

/**
 * Adapter: leaderboard — fetch HTML, regex racer row.
 * RAAM layout historically: <tr data-racer="610"> with <td class="lat">…</td> etc.
 * This is a placeholder heuristic until the real 2026 layout is published.
 */
async function runLeaderboard(url: string): Promise<FetchResult> {
  const racerNum = getenv("RAAM_RACER_NUMBER") ?? "610";
  const ua =
    getenv("RAAM_TRACKER_USER_AGENT") ??
    "Mozilla/5.0 (compatible; TeamKabirBot/1.0; +https://raam-2026.vercel.app)";

  let html = "";
  try {
    const res = await fetch(url, { headers: { "user-agent": ua } });
    if (!res.ok) {
      return {
        ok: false,
        adapter: "leaderboard",
        error: `HTTP ${res.status}`,
      };
    }
    html = await res.text();
  } catch (e) {
    return {
      ok: false,
      adapter: "leaderboard",
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // Heuristic scrape — look for a row containing the racer number and
  // extract decimal lat/lng that appear near it (within ~500 chars).
  const idx = html.indexOf(`"${racerNum}"`);
  const slice = idx >= 0 ? html.slice(idx, idx + 800) : "";
  const latMatch = slice.match(/lat[^0-9\-]{0,8}(-?\d{1,3}\.\d{3,8})/i);
  const lngMatch = slice.match(/l(?:on|ng)[^0-9\-]{0,8}(-?\d{1,3}\.\d{3,8})/i);
  if (!latMatch || !lngMatch) {
    return {
      ok: false,
      adapter: "leaderboard",
      error: `couldn't locate lat/lng for racer ${racerNum}. Update adapter heuristics when 2026 HTML format is known.`,
    };
  }
  const lat = Number(latMatch[1]);
  const lng = Number(lngMatch[1]);

  return {
    ok: true,
    adapter: "leaderboard",
    position: {
      lat,
      lng,
      fetched_at: new Date().toISOString(),
    },
  };
}

/**
 * Public entrypoint — run the configured adapter and (optionally) upsert
 * a gps_ping row. Dedupes against the last stored ping when lat/lng match
 * within 10 meters (≈ 0.00009 degrees).
 */
export async function runTracker(): Promise<FetchResult> {
  const adapter = (getenv("RAAM_TRACKER_ADAPTER") ?? "disabled").toLowerCase();
  const url = getenv("RAAM_TRACKER_URL") ?? "";

  let result: FetchResult;
  if (adapter === "disabled" || !url) {
    result = await runDisabled();
  } else if (adapter === "generic_json") {
    result = await runGenericJson(url);
  } else if (adapter === "leaderboard") {
    result = await runLeaderboard(url);
  } else {
    return {
      ok: false,
      adapter,
      error: `unknown RAAM_TRACKER_ADAPTER: ${adapter}`,
    };
  }

  if (!result.ok || !result.position) return result;

  // Dedup: skip if last ping within ~10m of this position
  const admin = createAdminClient();
  const { data: prior } = await admin
    .from("gps_ping")
    .select("lat,lng,ts")
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (prior) {
    const dLat = Math.abs(Number(prior.lat) - result.position.lat);
    const dLng = Math.abs(Number(prior.lng) - result.position.lng);
    if (dLat < 0.0001 && dLng < 0.0001) {
      return { ...result, note: "dedup — position unchanged from last ping" };
    }
  }

  // Forward to /api/gps/ping so Map Matching + mile lookup + engine run fire.
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const secret = process.env.INGEST_SECRET;
  if (!secret) {
    return { ...result, error: "INGEST_SECRET missing — cannot forward ping" };
  }

  try {
    const r = await fetch(`${host}/api/gps/ping`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-ingest-secret": secret,
      },
      body: JSON.stringify({
        lat: result.position.lat,
        lng: result.position.lng,
        speed_mph: result.position.speed_mph,
        mile_from_start: result.position.mile_from_start,
        source: `raam_tracker:${adapter}`,
        device_id: `raam#${getenv("RAAM_RACER_NUMBER") ?? "610"}`,
      }),
    });
    const body = (await r.json().catch(() => ({}))) as {
      engine?: unknown;
    };
    return {
      ...result,
      inserted: r.status < 300,
      engine: body.engine,
      error: r.ok ? undefined : `ping endpoint HTTP ${r.status}`,
    };
  } catch (e) {
    return {
      ...result,
      error: `forward failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
