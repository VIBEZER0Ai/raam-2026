/**
 * Route lookup: map arbitrary lat/lng → nearest mile marker on the GPX polyline.
 *
 * Loads public/raam/route.geojson once per server instance, precomputes
 * cumulative-mile table over the 1,387-point simplified route, and exposes
 * `milesFromStart({ lat, lng })`.
 *
 * Trade-offs:
 * - Linear O(N) scan per lookup. At N≈1500 and low ping rate it's fine.
 *   For high-frequency ingestion, swap in a kd-tree or H3 index.
 * - Accuracy capped at ~2-3 miles because polyline is RDP-simplified.
 *   Good enough for TS routing and rule-engine triggers.
 *
 * Source of miles: sum of Haversine distances between consecutive points.
 * Units: miles (for parity with time_station.mile_total).
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface Cache {
  coords: [number, number][]; // [lng, lat]
  cumulativeMi: number[]; // same length as coords; cumulativeMi[i] = miles from start to point i
  totalMi: number;
}

let cache: Cache | null = null;
let pending: Promise<Cache> | null = null;

const EARTH_MI = 3958.7613; // mean earth radius, miles

function haversineMi(a: [number, number], b: [number, number]): number {
  // a,b: [lng, lat]
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.min(1, Math.sqrt(s)));
}

async function loadRoute(): Promise<Cache> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const path = join(process.cwd(), "public", "raam", "route.geojson");
    const raw = await readFile(path, "utf8");
    const fc = JSON.parse(raw) as {
      features: Array<{
        geometry: { type: string; coordinates: [number, number][] };
      }>;
    };
    const feature = fc.features[0];
    if (!feature || feature.geometry.type !== "LineString") {
      throw new Error("route.geojson missing LineString feature");
    }
    const coords = feature.geometry.coordinates;
    const cumulativeMi: number[] = [0];
    for (let i = 1; i < coords.length; i++) {
      cumulativeMi.push(
        cumulativeMi[i - 1] + haversineMi(coords[i - 1], coords[i]),
      );
    }
    const totalMi = cumulativeMi[cumulativeMi.length - 1];
    cache = { coords, cumulativeMi, totalMi };
    pending = null;
    return cache;
  })();
  return pending;
}

/**
 * Given a probe point, find the nearest polyline vertex and return
 * its cumulative mile-from-start, along with the straight-line deviation.
 *
 * Returns null if route file missing or probe is > 50 miles off-route
 * (likely bogus ping).
 */
export async function milesFromStart(probe: {
  lat: number;
  lng: number;
}): Promise<{ mile_from_start: number; deviation_mi: number } | null> {
  const route = await loadRoute().catch(() => null);
  if (!route) return null;

  let bestI = 0;
  let bestD = Infinity;
  const probeLngLat: [number, number] = [probe.lng, probe.lat];
  for (let i = 0; i < route.coords.length; i++) {
    const d = haversineMi(probeLngLat, route.coords[i]);
    if (d < bestD) {
      bestD = d;
      bestI = i;
    }
  }
  if (bestD > 50) return null; // way off route

  // Refine: project onto the nearer of the two adjacent edges to the best vertex.
  // This improves lookup accuracy between polyline points.
  let refinedMi = route.cumulativeMi[bestI];
  const neighbor =
    bestI === 0
      ? 1
      : bestI === route.coords.length - 1
        ? bestI - 1
        : (() => {
            const prevD = haversineMi(probeLngLat, route.coords[bestI - 1]);
            const nextD = haversineMi(probeLngLat, route.coords[bestI + 1]);
            return prevD < nextD ? bestI - 1 : bestI + 1;
          })();
  if (neighbor !== bestI) {
    const a = route.coords[bestI];
    const b = route.coords[neighbor];
    // Project probe onto segment a→b in lng/lat space (degrees — fine for short edges)
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lenSq = dx * dx + dy * dy;
    if (lenSq > 0) {
      const t = Math.max(
        0,
        Math.min(
          1,
          ((probe.lng - a[0]) * dx + (probe.lat - a[1]) * dy) / lenSq,
        ),
      );
      const projLng = a[0] + t * dx;
      const projLat = a[1] + t * dy;
      const edgeMi = haversineMi(a, b);
      const projOffsetMi = t * edgeMi;
      const startMi = route.cumulativeMi[bestI];
      const endMi = route.cumulativeMi[neighbor];
      const signedMi =
        neighbor > bestI
          ? startMi + projOffsetMi
          : startMi - projOffsetMi;
      refinedMi = Math.max(0, Math.min(route.totalMi, signedMi));
      bestD = haversineMi(probeLngLat, [projLng, projLat]);
    }
  }

  return {
    mile_from_start: Number(refinedMi.toFixed(2)),
    deviation_mi: Number(bestD.toFixed(2)),
  };
}

/** Total route length from polyline (miles). */
export async function routeTotalMi(): Promise<number> {
  const route = await loadRoute();
  return route.totalMi;
}
