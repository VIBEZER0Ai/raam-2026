/**
 * Units preference + conversion helpers.
 *
 * RAAM is a US race; route book + GPX + DB-stored mile values stay imperial.
 * This module converts on the display boundary based on the team's `units`
 * preference (`imperial` | `metric`).
 *
 * Single rule: storage is imperial, display obeys preference.
 */

export type UnitsPref = "imperial" | "metric";

export const MI_PER_KM = 0.621371;
export const KM_PER_MI = 1 / MI_PER_KM;
export const FT_PER_M = 3.28084;
export const M_PER_FT = 1 / FT_PER_M;

/* ---------------- Distance ---------------- */

/** Convert miles → kilometers. */
export function miToKm(mi: number): number {
  return mi * KM_PER_MI;
}

/**
 * Format a stored-mile value per pref.
 *   formatDistance(88.4, "imperial") → "88.4 mi"
 *   formatDistance(88.4, "metric")   → "142.3 km"
 */
export function formatDistance(
  miles: number,
  pref: UnitsPref,
  digits = 1,
): string {
  if (pref === "metric") {
    return `${miToKm(miles).toFixed(digits)} km`;
  }
  return `${miles.toFixed(digits)} mi`;
}

/** Just the number, without the unit suffix. */
export function distanceValue(miles: number, pref: UnitsPref): number {
  return pref === "metric" ? miToKm(miles) : miles;
}

/** Unit suffix only — useful inside table headers. */
export function distanceUnit(pref: UnitsPref): "mi" | "km" {
  return pref === "metric" ? "km" : "mi";
}

/* ---------------- Speed ---------------- */

/** Convert mph → kph. */
export function mphToKph(mph: number): number {
  return mph * KM_PER_MI;
}

export function formatSpeed(
  mph: number,
  pref: UnitsPref,
  digits = 1,
): string {
  if (pref === "metric") {
    return `${mphToKph(mph).toFixed(digits)} km/h`;
  }
  return `${mph.toFixed(digits)} mph`;
}

export function speedUnit(pref: UnitsPref): "mph" | "km/h" {
  return pref === "metric" ? "km/h" : "mph";
}

/* ---------------- Elevation ---------------- */

export function ftToM(ft: number): number {
  return ft * M_PER_FT;
}

/** Stored values from GPX are already in meters. Convert for display when pref=imperial. */
export function metersToFt(m: number): number {
  return m * FT_PER_M;
}

/**
 * Format an elevation. We accept meters because the GPX trkpts store ele in m.
 *   formatElevationM(3309, "imperial") → "10,856 ft"
 *   formatElevationM(3309, "metric")   → "3,309 m"
 */
export function formatElevationM(meters: number, pref: UnitsPref): string {
  if (pref === "imperial") {
    return `${Math.round(metersToFt(meters)).toLocaleString()} ft`;
  }
  return `${Math.round(meters).toLocaleString()} m`;
}

/* ---------------- Temperature ---------------- */

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

/**
 * Format a temperature. We accept Fahrenheit because most US weather APIs
 * default to it; convert when pref=metric.
 *   formatTempF(95, "imperial") → "95°F"
 *   formatTempF(95, "metric")   → "35°C"
 */
export function formatTempF(f: number, pref: UnitsPref): string {
  if (pref === "metric") {
    return `${Math.round(fToC(f))}°C`;
  }
  return `${Math.round(f)}°F`;
}

/** Open-Meteo returns Celsius natively — accept C and convert when pref=imperial. */
export function formatTempC(c: number, pref: UnitsPref): string {
  if (pref === "imperial") {
    return `${Math.round(cToF(c))}°F`;
  }
  return `${Math.round(c)}°C`;
}

export function tempUnit(pref: UnitsPref): "°F" | "°C" {
  return pref === "metric" ? "°C" : "°F";
}
