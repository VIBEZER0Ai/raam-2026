/**
 * Weather page — fetches real Open-Meteo data for rider position + next N TS,
 * computes headwind/tailwind classification, and renders units-aware.
 *
 * Server component so we can hit Open-Meteo with Next fetch revalidate (15min)
 * and avoid leaking any keys to the client (no key required, just hygienic).
 */

import { Weather, type WeatherSegmentProps } from "@/components/screens/weather";
import {
  getDerivedRaceState,
  getTimeStations,
  type DbTimeStation,
} from "@/lib/db/queries";
import { getDefaultTeam } from "@/lib/team";
import {
  bearing,
  classifyWind,
  fetchWeather,
  type WeatherForecast,
} from "@/lib/raam/weather";

export const revalidate = 900; // 15 min — matches Open-Meteo cache budget

const FORECAST_TS_COUNT = 6;

export default async function WeatherPage() {
  const [team, derived, stations] = await Promise.all([
    getDefaultTeam(),
    getDerivedRaceState(),
    getTimeStations(),
  ]);
  const units = team?.units ?? "imperial";

  // Rider anchor — fall back to TS0 start coords pre-race.
  const riderLat = derived.latest?.lat ?? Number(stations[0]?.lat ?? 33.1944);
  const riderLng = derived.latest?.lng ?? Number(stations[0]?.lng ?? -117.3842);
  const currentTs = derived.currentTs;

  // Next N TS ahead of rider with valid coords.
  const upcoming = stations
    .filter(
      (s): s is DbTimeStation & { lat: number; lng: number } =>
        s.ts_num > currentTs && s.lat !== null && s.lng !== null,
    )
    .slice(0, FORECAST_TS_COUNT);

  // Concurrent fetches; each wrapped to suppress per-call failures.
  const safeFetch = async (
    lat: number,
    lon: number,
  ): Promise<WeatherForecast | null> => {
    try {
      return await fetchWeather(lat, lon, 6);
    } catch (e) {
      console.error("[weather] fetch failed", e);
      return null;
    }
  };

  const [riderWx, ...tsWx] = await Promise.all([
    safeFetch(riderLat, riderLng),
    ...upcoming.map((s) => safeFetch(Number(s.lat), Number(s.lng))),
  ]);

  // Build per-segment view models. Each segment is rider→ts1, ts1→ts2, ...
  // The upstream-TS weather is the forecast for that segment (rider
  // experiences those conditions on approach to that TS).
  const segments: WeatherSegmentProps[] = [];
  let prev: { lat: number; lng: number; mile: number; label: string } = {
    lat: riderLat,
    lng: riderLng,
    mile: derived.currentMile,
    label: currentTs > 0 ? `TS${currentTs}` : "Start",
  };
  for (let i = 0; i < upcoming.length; i++) {
    const ts = upcoming[i];
    const wx = tsWx[i];
    const route = bearing(prev.lat, prev.lng, Number(ts.lat), Number(ts.lng));
    const cls = wx
      ? classifyWind(route, wx.now.windDirDeg, wx.now.windKph)
      : null;
    segments.push({
      fromLabel: prev.label,
      toLabel: `TS${ts.ts_num} ${ts.name}`,
      miles: Math.max(0, Number(ts.mile_total) - prev.mile),
      route_bearing: route,
      weather: wx,
      classification: cls,
    });
    prev = {
      lat: Number(ts.lat),
      lng: Number(ts.lng),
      mile: Number(ts.mile_total),
      label: `TS${ts.ts_num}`,
    };
  }

  return (
    <Weather
      units={units}
      anchorLabel={
        currentTs > 0
          ? `TS${currentTs} (rider)`
          : "Pre-race · Oceanside start"
      }
      now={riderWx}
      segments={segments}
    />
  );
}
