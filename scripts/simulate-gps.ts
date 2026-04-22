#!/usr/bin/env tsx
/**
 * GPS progression simulator.
 *
 * Walks the 2022 GPX polyline (public/raam/route.geojson), posting
 * synthetic pings to /api/gps/ping to exercise the full pipeline:
 *   - mile_from_start lookup
 *   - Mapbox Map Matching
 *   - rule engine (90-min rule, GPS silence, Shermer, regional zones)
 *   - Discord alerts on critical firings
 *
 * Usage:
 *   pnpm simulate:gps [options]
 *
 * Options (all optional, key=value):
 *   base=<url>           Target URL. Default http://localhost:3000
 *                         Use https://raam-2026.vercel.app for prod.
 *   secret=<string>      x-ingest-secret header. Default: $INGEST_SECRET
 *   start_mile=<n>       Starting mile. Default 0
 *   end_mile=<n>         Ending mile. Default start + 50
 *   speed=<mph>          Avg speed. Default 13
 *   interval_s=<n>       Seconds between pings. Default 30
 *   scenario=<name>      normal | speed_crash | gps_silence | sleep_debt
 *                         Default: normal
 *   real_time=<bool>     true=wait actual interval between pings.
 *                         false=fire as fast as possible. Default false
 *   count=<n>            Max pings. Default computed from start→end
 *
 * Scenarios:
 *   normal         — constant speed, normal progression
 *   speed_crash    — drop to 6 mph for 20 min mid-run (triggers 90-min rule)
 *   gps_silence    — stop pinging for 65 min, then resume (triggers silence)
 *   sleep_debt     — simulate 26h awake + 35% recovery (via rest_log hint)
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setDefaultResultOrder } from "node:dns";
import { config as loadEnv } from "dotenv";

setDefaultResultOrder("ipv4first");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
loadEnv({ path: join(ROOT, ".env.local") });

interface Args {
  base: string;
  secret: string | null;
  start_mile: number;
  end_mile: number;
  speed: number;
  interval_s: number;
  scenario: "normal" | "speed_crash" | "gps_silence" | "sleep_debt";
  real_time: boolean;
  count: number | null;
}

function parseArgs(): Args {
  const a: Record<string, string> = {};
  for (const raw of process.argv.slice(2)) {
    const idx = raw.indexOf("=");
    if (idx < 0) continue;
    a[raw.slice(0, idx).trim()] = raw.slice(idx + 1).trim();
  }
  const start_mile = Number(a.start_mile ?? 0);
  const end_mile = Number(a.end_mile ?? start_mile + 50);
  const speed = Number(a.speed ?? 13);
  const interval_s = Number(a.interval_s ?? 30);
  return {
    base: a.base ?? "http://localhost:3000",
    secret: a.secret ?? process.env.INGEST_SECRET ?? null,
    start_mile,
    end_mile,
    speed,
    interval_s,
    scenario:
      (a.scenario as Args["scenario"]) ?? "normal",
    real_time: (a.real_time ?? "false") === "true",
    count: a.count ? Number(a.count) : null,
  };
}

interface Point {
  lat: number;
  lng: number;
  mile: number;
}

const EARTH_MI = 3958.7613;
function haversine(a: [number, number], b: [number, number]): number {
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.min(1, Math.sqrt(s)));
}

async function loadRoute(): Promise<{
  coords: [number, number][];
  cumMi: number[];
  totalMi: number;
}> {
  const path = join(ROOT, "public", "raam", "route.geojson");
  const raw = await readFile(path, "utf8");
  const fc = JSON.parse(raw) as {
    features: Array<{
      geometry: { coordinates: [number, number][]; type: string };
    }>;
  };
  const coords = fc.features[0].geometry.coordinates;
  const cumMi: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    cumMi.push(cumMi[i - 1] + haversine(coords[i - 1], coords[i]));
  }
  return { coords, cumMi, totalMi: cumMi[cumMi.length - 1] };
}

/** Return lat/lng on the polyline at a given mile offset. */
function pointAtMile(
  route: Awaited<ReturnType<typeof loadRoute>>,
  mile: number,
): Point {
  const { coords, cumMi } = route;
  // Binary search for segment
  let lo = 0;
  let hi = cumMi.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumMi[mid] < mile) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const prevMi = cumMi[i - 1];
  const nextMi = cumMi[i];
  const t = nextMi === prevMi ? 0 : (mile - prevMi) / (nextMi - prevMi);
  const a = coords[i - 1];
  const b = coords[i];
  return {
    lng: a[0] + t * (b[0] - a[0]),
    lat: a[1] + t * (b[1] - a[1]),
    mile,
  };
}

function stateFromMile(mile: number): string {
  if (mile < 234) return "CA";
  if (mile < 691) return "AZ";
  if (mile < 731) return "UT";
  if (mile < 1237) return "CO";
  if (mile < 1740) return "KS";
  if (mile < 1997) return "MO";
  if (mile < 2090) return "IL";
  if (mile < 2295) return "IN";
  if (mile < 2513) return "OH";
  if (mile < 2645) return "WV";
  if (mile < 2836) return "MD";
  return "NJ";
}

async function postPing(
  args: Args,
  body: Record<string, unknown>,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${args.base}/api/gps/ping`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(args.secret ? { "x-ingest-secret": args.secret } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

function speedForPing(
  args: Args,
  pingIdx: number,
  totalPings: number,
): number {
  if (args.scenario === "speed_crash") {
    // 20 minutes of <9 mph starting at 40% through
    const crashStart = Math.floor(totalPings * 0.4);
    const crashDuration = Math.ceil((20 * 60) / args.interval_s);
    if (pingIdx >= crashStart && pingIdx < crashStart + crashDuration) {
      return 6.5;
    }
  }
  // Small +/- 10% jitter on normal pings
  const jitter = 1 + (Math.random() - 0.5) * 0.2;
  return Number((args.speed * jitter).toFixed(1));
}

async function main() {
  const args = parseArgs();
  console.log("[sim] args:", args);
  if (!args.secret) {
    console.warn(
      "[sim] no INGEST_SECRET. Pings will require an authenticated session\n" +
        "      — if this is a remote target you probably want secret=.\n",
    );
  }

  const route = await loadRoute();
  console.log(
    `[sim] route loaded: ${route.coords.length} pts, ${route.totalMi.toFixed(1)} mi total`,
  );
  if (args.end_mile > route.totalMi) {
    console.warn(
      `[sim] end_mile ${args.end_mile} > route total ${route.totalMi.toFixed(1)} — clamping`,
    );
    args.end_mile = route.totalMi;
  }

  // How many pings
  const dtHours = args.interval_s / 3600;
  const milesPerPing = args.speed * dtHours;
  const totalPings =
    args.count ?? Math.ceil((args.end_mile - args.start_mile) / milesPerPing);
  console.log(`[sim] ${totalPings} pings @ ${args.interval_s}s interval`);

  if (args.scenario === "gps_silence") {
    console.log(
      "[sim] scenario=gps_silence — will pause 65 min mid-run (simulated wall time only)",
    );
  }
  if (args.scenario === "speed_crash") {
    console.log(
      "[sim] scenario=speed_crash — will drop speed to 6.5 mph for 20 min at 40% through",
    );
  }

  let currentMile = args.start_mile;
  let silenceInjected = false;
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < totalPings; i++) {
    const speed = speedForPing(args, i, totalPings);
    const p = pointAtMile(route, Math.min(currentMile, route.totalMi));
    const pct = totalPings > 0 ? (i / totalPings) * 100 : 100;
    const { status, body } = await postPing(args, {
      lat: p.lat,
      lng: p.lng,
      speed_mph: speed,
      mile_from_start: p.mile,
      state: stateFromMile(p.mile),
      source: `sim:${args.scenario}`,
      note: `sim ping ${i + 1}/${totalPings}`,
    });
    const summary =
      typeof body === "object" && body !== null && "engine" in body
        ? (
            (body as { engine?: { persisted?: number; discord_sent?: number } })
              .engine
          )
        : null;
    const engineStr = summary
      ? ` · engine fired:${summary.persisted ?? 0} discord:${summary.discord_sent ?? 0}`
      : "";
    if (status < 300) {
      ok += 1;
      console.log(
        `[${i + 1}/${totalPings}] HTTP ${status} mi ${p.mile.toFixed(1)} ${speed.toFixed(1)}mph ${stateFromMile(p.mile)} ${pct.toFixed(0)}%${engineStr}`,
      );
    } else {
      fail += 1;
      console.warn(
        `[${i + 1}/${totalPings}] HTTP ${status}`,
        JSON.stringify(body).slice(0, 200),
      );
    }

    // Advance mile
    currentMile += milesPerPing;

    // Inject GPS silence mid-run
    if (
      args.scenario === "gps_silence" &&
      !silenceInjected &&
      i === Math.floor(totalPings / 2)
    ) {
      silenceInjected = true;
      if (args.real_time) {
        console.log(
          `[sim] injecting 65-min silence — waiting real-time (${65 * 60}s)…`,
        );
        await new Promise((r) => setTimeout(r, 65 * 60_000));
      } else {
        // In non-real-time mode we just fake the timestamp by waiting 0
        // — the engine will see <60min since last ping and won't fire
        // silence rule. Set real_time=true to actually trigger it.
        console.log(
          "[sim] silence injection requires real_time=true to actually trigger GPS silence rule",
        );
      }
    }

    if (args.real_time && i < totalPings - 1) {
      await new Promise((r) => setTimeout(r, args.interval_s * 1000));
    } else {
      // Micro-throttle to avoid pegging Mapbox + Supabase
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\n[sim] done. ${ok} ok · ${fail} failed.`);
}

main().catch((e) => {
  console.error("[sim] fatal:", e);
  process.exit(1);
});
