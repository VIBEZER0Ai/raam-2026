/**
 * Vehicle separation math — used by AA6.3 banner + AA6.9 status screen.
 *
 * SOP rule: follow + leapfrog must stay within 30 minutes of each other at
 * current speed (Kabir's call, 2026-04-27). Outside that window we surface a
 * red banner so the on-duty crew can close the gap.
 */

const EARTH_KM = 6371.0088;
const KM_PER_MI = 1.609344;

const TO_RAD = Math.PI / 180;

export function haversineMiles(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = (bLat - aLat) * TO_RAD;
  const dLon = (bLng - aLng) * TO_RAD;
  const lat1 = aLat * TO_RAD;
  const lat2 = bLat * TO_RAD;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const km = 2 * EARTH_KM * Math.asin(Math.sqrt(h));
  return km / KM_PER_MI;
}

export interface VehicleSeparation {
  miles: number;
  /** Time-distance in minutes at the speed used (default 35 mph cruise). */
  minutes: number;
  /** True when SOP "30 min apart" rule is breached. */
  exceedsSop: boolean;
  /** True when even the GPS pings are stale (>10 min) — can't trust value. */
  stale: boolean;
}

const SOP_MINUTES = 30;
const STALE_PING_MIN = 10;
const FALLBACK_SPEED_MPH = 35;

export function computeSeparation(
  followLat: number,
  followLng: number,
  leapLat: number,
  leapLng: number,
  options: {
    speedMph?: number;
    followPingAt?: string;
    leapPingAt?: string;
    now?: number;
  } = {},
): VehicleSeparation {
  const miles = haversineMiles(followLat, followLng, leapLat, leapLng);
  const speed = Math.max(options.speedMph ?? FALLBACK_SPEED_MPH, 1);
  const minutes = (miles / speed) * 60;

  const now = options.now ?? Date.now();
  const followAge = options.followPingAt
    ? (now - new Date(options.followPingAt).getTime()) / 60_000
    : 0;
  const leapAge = options.leapPingAt
    ? (now - new Date(options.leapPingAt).getTime()) / 60_000
    : 0;
  const stale = Math.max(followAge, leapAge) > STALE_PING_MIN;

  return {
    miles: Number(miles.toFixed(2)),
    minutes: Number(minutes.toFixed(1)),
    exceedsSop: minutes > SOP_MINUTES,
    stale,
  };
}

export const VEHICLE_SEP_SOP_MINUTES = SOP_MINUTES;
export const VEHICLE_PING_STALE_MINUTES = STALE_PING_MIN;
