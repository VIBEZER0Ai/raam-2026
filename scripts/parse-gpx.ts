#!/usr/bin/env tsx
/**
 * Parse RAAM GPX → simplified GeoJSON route polyline.
 *
 * Input:  full-size GPX track file (~40MB, 140k points)
 * Output: public/raam/route.geojson — simplified LineString under ~200KB
 *
 * Simplification: combination of Nth-point downsample then Ramer-Douglas-Peucker
 * with a tolerance in degrees. Coast-to-coast routes hold shape well at 1500 pts.
 *
 * Usage:
 *   pnpm parse-gpx <input.gpx> [output.geojson] [targetPoints]
 *
 * Defaults: input path required; output public/raam/route.geojson; target 1500.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

interface Point {
  lat: number;
  lng: number;
}

function extractTrkpts(xml: string): Point[] {
  // Single regex pass — extracts lat + lon from each <trkpt> tag.
  // Order of attributes can vary: lat then lon, or lon then lat.
  const rx = /<trkpt\s+([^>]*?)\/?>/g;
  const latRx = /lat="([-0-9.]+)"/;
  const lonRx = /lon="([-0-9.]+)"/;
  const pts: Point[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(xml)) !== null) {
    const attrs = m[1];
    const latM = latRx.exec(attrs);
    const lonM = lonRx.exec(attrs);
    if (!latM || !lonM) continue;
    const lat = Number(latM[1]);
    const lng = Number(lonM[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    pts.push({ lat, lng });
  }
  return pts;
}

/** Keep every Nth point. */
function downsample(pts: Point[], stride: number): Point[] {
  if (stride <= 1) return pts;
  const out: Point[] = [];
  for (let i = 0; i < pts.length; i += stride) out.push(pts[i]);
  // Always keep the last point for accurate finish position
  if (out[out.length - 1] !== pts[pts.length - 1]) {
    out.push(pts[pts.length - 1]);
  }
  return out;
}

/** Perpendicular distance from point p to line (a,b). Degrees. */
function perpDist(p: Point, a: Point, b: Point): number {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  if (dx === 0 && dy === 0) {
    const ex = p.lng - a.lng;
    const ey = p.lat - a.lat;
    return Math.sqrt(ex * ex + ey * ey);
  }
  const t =
    ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / (dx * dx + dy * dy);
  const projX = a.lng + t * dx;
  const projY = a.lat + t * dy;
  const ex = p.lng - projX;
  const ey = p.lat - projY;
  return Math.sqrt(ex * ex + ey * ey);
}

/** Ramer-Douglas-Peucker. tolerance in degrees. */
function rdp(pts: Point[], tol: number): Point[] {
  if (pts.length < 3) return pts;
  const first = 0;
  const last = pts.length - 1;
  const keep = new Uint8Array(pts.length);
  keep[first] = 1;
  keep[last] = 1;

  const stack: [number, number][] = [[first, last]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let maxD = 0;
    let maxI = -1;
    for (let i = s + 1; i < e; i++) {
      const d = perpDist(pts[i], pts[s], pts[e]);
      if (d > maxD) {
        maxD = d;
        maxI = i;
      }
    }
    if (maxD > tol && maxI !== -1) {
      keep[maxI] = 1;
      stack.push([s, maxI]);
      stack.push([maxI, e]);
    }
  }

  const out: Point[] = [];
  for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

async function main() {
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error("Usage: pnpm parse-gpx <input.gpx> [output.geojson] [targetPoints]");
    process.exit(1);
  }
  const input = inputArg.startsWith("/") ? inputArg : join(ROOT, inputArg);
  const output =
    process.argv[3] ?? join(ROOT, "public", "raam", "route.geojson");
  const target = Number(process.argv[4] ?? 1500);

  console.log(`[gpx] reading ${input}`);
  const xml = await readFile(input, "utf8");
  console.log(`[gpx] parsed ${(xml.length / 1024 / 1024).toFixed(1)}MB XML`);

  const allPts = extractTrkpts(xml);
  console.log(`[gpx] extracted ${allPts.length.toLocaleString()} trackpoints`);
  if (allPts.length === 0) {
    console.error("[gpx] no trackpoints found. GPX file may use different schema.");
    process.exit(2);
  }

  // Stage 1: crude downsample to cut volume before RDP
  const stride = Math.max(1, Math.floor(allPts.length / (target * 6)));
  const staged = downsample(allPts, stride);
  console.log(
    `[gpx] stage 1 (stride ${stride}): ${staged.length.toLocaleString()} points`,
  );

  // Stage 2: RDP simplification. Bump tolerance until we land near target.
  let tol = 0.0005; // ~50m at mid-latitudes
  let simplified = rdp(staged, tol);
  for (let i = 0; i < 10 && simplified.length > target * 1.15; i++) {
    tol *= 1.5;
    simplified = rdp(staged, tol);
  }
  console.log(
    `[gpx] stage 2 (RDP tol ${tol.toExponential(2)}): ${simplified.length.toLocaleString()} points`,
  );

  const geojson = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {
          name: "RAAM route polyline",
          source_gpx: inputArg,
          original_point_count: allPts.length,
          simplified_point_count: simplified.length,
          rdp_tolerance_deg: tol,
          generated_at: new Date().toISOString(),
        },
        geometry: {
          type: "LineString" as const,
          coordinates: simplified.map((p) => [
            Number(p.lng.toFixed(5)),
            Number(p.lat.toFixed(5)),
          ]),
        },
      },
    ],
  };

  await mkdir(dirname(output), { recursive: true });
  const json = JSON.stringify(geojson);
  await writeFile(output, json);
  console.log(
    `[gpx] wrote ${output} (${(json.length / 1024).toFixed(1)}KB)`,
  );
}

main().catch((e) => {
  console.error("[gpx] fatal:", e);
  process.exit(1);
});
