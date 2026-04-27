#!/usr/bin/env tsx
/**
 * Extract TS waypoints from full-resolution GPX.
 *
 * The official 2026 GPX has zero <wpt> markers. Time stations are listed in the
 * route book by cumulative-mile only. We walk the trackpoints, accumulate
 * haversine distance, and snap each TS to the closest cumulative-mile point.
 *
 * Input:  public/raam/raam-2026.gpx
 * Output: public/raam/ts-waypoints.json
 *
 * The mile values below are taken from the 2026 RAAM Route Book (FINAL),
 * specifically the "You have completed N miles" header on each section page.
 * Source of truth lives in src/lib/raam/time-stations.ts; this script reads it.
 *
 * Usage:
 *   pnpm tsx scripts/extract-ts-waypoints.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TIME_STATIONS_2026 } from "../src/lib/raam/time-stations-2026.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

interface Pt {
  lat: number;
  lon: number;
  ele: number;
}

const MI_PER_KM = 0.621371;
const EARTH_KM = 6371.0088;

function haversineKm(a: Pt, b: Pt): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

function extractTrkpts(xml: string): Pt[] {
  const rx = /<trkpt\s+([^>]*?)>\s*(?:<ele>([-0-9.]+)<\/ele>\s*)?<\/trkpt>/g;
  const latRx = /lat="([-0-9.]+)"/;
  const lonRx = /lon="([-0-9.]+)"/;
  const pts: Pt[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(xml)) !== null) {
    const attrs = m[1];
    const eleStr = m[2];
    const latM = latRx.exec(attrs);
    const lonM = lonRx.exec(attrs);
    if (!latM || !lonM) continue;
    pts.push({
      lat: Number(latM[1]),
      lon: Number(lonM[1]),
      ele: eleStr ? Number(eleStr) : 0,
    });
  }
  return pts;
}

async function main() {
  const gpxPath = join(ROOT, "public", "raam", "raam-2026.gpx");
  const outPath = join(ROOT, "public", "raam", "ts-waypoints.json");

  console.log(`[ts] reading ${gpxPath}`);
  const xml = await readFile(gpxPath, "utf8");
  const pts = extractTrkpts(xml);
  console.log(`[ts] extracted ${pts.length.toLocaleString()} trackpoints`);
  if (pts.length < 2) {
    console.error("[ts] not enough points");
    process.exit(2);
  }

  // Build cumulative-mile index. Using straight haversine over densely-sampled
  // GPX gives mile-totals within ~0.5% of route-book values across 3000 mi.
  const cumMi: number[] = new Array(pts.length);
  cumMi[0] = 0;
  for (let i = 1; i < pts.length; i++) {
    const km = haversineKm(pts[i - 1], pts[i]);
    cumMi[i] = cumMi[i - 1] + km * MI_PER_KM;
  }
  const totalMi = cumMi[cumMi.length - 1];
  console.log(`[ts] gpx total: ${totalMi.toFixed(2)} mi`);

  // Snap each TS to nearest cumulative-mile index via binary search.
  function nearestIdx(targetMi: number): number {
    let lo = 0;
    let hi = cumMi.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumMi[mid] < targetMi) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0 && Math.abs(cumMi[lo - 1] - targetMi) < Math.abs(cumMi[lo] - targetMi)) {
      return lo - 1;
    }
    return lo;
  }

  const waypoints = TIME_STATIONS_2026.map((ts) => {
    const idx = nearestIdx(ts.mile_total);
    const p = pts[idx];
    return {
      ts_num: ts.ts_num,
      name: ts.name,
      state: ts.state,
      mile_total: ts.mile_total,
      mile_actual: Number(cumMi[idx].toFixed(2)),
      mile_drift: Number((cumMi[idx] - ts.mile_total).toFixed(2)),
      lat: Number(p.lat.toFixed(6)),
      lon: Number(p.lon.toFixed(6)),
      ele_m: Number(p.ele.toFixed(1)),
    };
  });

  // Diagnostic: max drift between book mile and gpx-derived mile.
  const maxDrift = waypoints.reduce(
    (m, w) => Math.max(m, Math.abs(w.mile_drift)),
    0,
  );
  console.log(`[ts] max book↔gpx drift: ${maxDrift.toFixed(2)} mi`);

  const out = {
    generated_at: new Date().toISOString(),
    source_gpx: "public/raam/raam-2026.gpx",
    gpx_total_mi: Number(totalMi.toFixed(2)),
    book_total_mi: TIME_STATIONS_2026[TIME_STATIONS_2026.length - 1].mile_total,
    max_drift_mi: Number(maxDrift.toFixed(2)),
    waypoints,
  };

  await writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(
    `[ts] wrote ${outPath} (${waypoints.length} waypoints, ${(JSON.stringify(out).length / 1024).toFixed(1)}KB)`,
  );
}

main().catch((e) => {
  console.error("[ts] fatal:", e);
  process.exit(1);
});
