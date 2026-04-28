/**
 * Open-Meteo client + headwind classification.
 *
 * Open-Meteo is free, no API key. We always request Celsius + km/h from the
 * API and let the display layer convert via lib/units.ts based on team pref.
 *
 * Caching: Next fetch with 900s revalidate (15 min) — enough for weather
 * planning, light enough on the public Open-Meteo allowance.
 */

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export interface WeatherNow {
  /** ISO timestamp of the observation. */
  time: string;
  /** Temperature in Celsius (raw API value). */
  tempC: number;
  /** Wind speed in km/h (raw API value). */
  windKph: number;
  /** Wind direction in compass degrees (0=N, 90=E, 180=S, 270=W). */
  windDirDeg: number;
  /** Precipitation in mm during the current hour. */
  precipMm: number;
  /** Apparent / "feels like" temperature in Celsius if available. */
  apparentC?: number;
}

export interface WeatherHour {
  time: string;
  tempC: number;
  windKph: number;
  windDirDeg: number;
  precipProbPct: number;
  precipMm: number;
}

export interface WeatherForecast {
  lat: number;
  lon: number;
  fetchedAt: string;
  now: WeatherNow;
  next6h: WeatherHour[];
}

/** Type guard for Open-Meteo responses we care about. */
interface OpenMeteoRes {
  current?: {
    time?: string;
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    precipitation?: number;
    apparent_temperature?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
  };
}

/**
 * Fetch current + next-6h weather for a coord.
 *
 * Throws on network/HTTP error. Caller decides how to surface.
 */
export async function fetchWeather(
  lat: number,
  lon: number,
  hours = 6,
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(5),
    longitude: lon.toFixed(5),
    current:
      "temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation",
    hourly:
      "temperature_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,precipitation",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    forecast_hours: String(hours),
    timezone: "auto",
  });

  const url = `${OPEN_METEO_URL}?${params}`;
  const res = await fetch(url, {
    next: { revalidate: 900 }, // 15 min
  });
  if (!res.ok) {
    throw new Error(`open-meteo ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as OpenMeteoRes;
  if (!data.current || !data.hourly) {
    throw new Error("open-meteo: malformed response");
  }

  const now: WeatherNow = {
    time: data.current.time ?? new Date().toISOString(),
    tempC: data.current.temperature_2m ?? 0,
    windKph: data.current.wind_speed_10m ?? 0,
    windDirDeg: data.current.wind_direction_10m ?? 0,
    precipMm: data.current.precipitation ?? 0,
    apparentC: data.current.apparent_temperature,
  };

  const h = data.hourly;
  const len = h.time?.length ?? 0;
  const next6h: WeatherHour[] = [];
  for (let i = 0; i < Math.min(len, hours); i++) {
    next6h.push({
      time: h.time?.[i] ?? "",
      tempC: h.temperature_2m?.[i] ?? 0,
      windKph: h.wind_speed_10m?.[i] ?? 0,
      windDirDeg: h.wind_direction_10m?.[i] ?? 0,
      precipProbPct: h.precipitation_probability?.[i] ?? 0,
      precipMm: h.precipitation?.[i] ?? 0,
    });
  }

  return {
    lat,
    lon,
    fetchedAt: new Date().toISOString(),
    now,
    next6h,
  };
}

/* ---------------- Bearing + headwind math ---------------- */

const TO_RAD = Math.PI / 180;
const TO_DEG = 180 / Math.PI;

/**
 * Initial bearing (deg, 0=N, clockwise) from point A to B on a sphere.
 * Use this with two consecutive TS coords to get the route direction the
 * rider is facing through that segment.
 */
export function bearing(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): number {
  const lat1 = fromLat * TO_RAD;
  const lat2 = toLat * TO_RAD;
  const dLon = (toLon - fromLon) * TO_RAD;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * TO_DEG + 360) % 360;
}

export type WindRelation = "headwind" | "tailwind" | "crosswind-l" | "crosswind-r";

export interface WindClassification {
  /** Relative angle (0=tailwind, 180=headwind), unsigned 0..180. */
  relAngle: number;
  /** Component along route direction in km/h. + = tailwind, − = headwind. */
  componentKph: number;
  relation: WindRelation;
}

/**
 * Classify how a wind affects a rider on a given route segment.
 *
 *   route       = bearing the rider is travelling (deg, 0=N)
 *   windFromDeg = direction wind is COMING FROM (Open-Meteo convention)
 *
 * Resolved into:
 *   - relAngle 0  → tailwind
 *   - relAngle 90 → crosswind
 *   - relAngle 180 → headwind
 *
 * Components:
 *   componentKph > 0 = tailwind boost
 *   componentKph < 0 = headwind drag
 */
export function classifyWind(
  routeBearing: number,
  windFromDeg: number,
  windKph: number,
): WindClassification {
  // Wind direction TOWARD which it's blowing.
  const windToDeg = (windFromDeg + 180) % 360;
  // Difference between route direction and wind-blow-toward direction.
  const diff = ((windToDeg - routeBearing + 540) % 360) - 180; // -180..180
  const relAngle = Math.abs(diff);
  // Project wind speed onto route axis. cos(0) = +1 (tailwind).
  const componentKph = Math.cos(relAngle * TO_RAD) * windKph;

  let relation: WindRelation;
  if (relAngle < 45) relation = "tailwind";
  else if (relAngle > 135) relation = "headwind";
  else if (diff > 0) relation = "crosswind-r"; // wind from rider's left, blowing right
  else relation = "crosswind-l";

  return {
    relAngle,
    componentKph: Number(componentKph.toFixed(1)),
    relation,
  };
}

/** Cardinal direction label for a compass-degree heading. */
export function compassLabel(deg: number): string {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}
