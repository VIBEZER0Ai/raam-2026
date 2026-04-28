"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { DbTimeStation } from "@/lib/db/queries";
import type { SectionFlag } from "@/lib/raam/time-stations-2026";

/** Marker color per primary section flag. Highest-severity flag wins. */
const FLAG_COLOR: Record<SectionFlag, string> = {
  "racers-only": "#ef4444",              // red — no support at all
  "no-aux-vehicles": "#f97316",          // orange — aux must take alt route
  "no-rvs": "#fb923c",                   // light orange — RV restriction
  "shuttle-zone": "#a855f7",             // purple — bike loaded into vehicle
  "direct-follow-mandatory": "#3b82f6",  // blue — both vehicles glued
  "leapfrog-daytime": "#facc15",         // yellow — leapfrog only
  "tz-change": "#06b6d4",                // cyan — clock change
  "altitude-pass": "#94a3b8",            // slate — major mountain
  "no-services": "#737373",              // gray — long unsupported food/gas run
};
/** Severity rank — higher value = more important when picking dominant flag. */
const FLAG_RANK: Record<SectionFlag, number> = {
  "racers-only": 9,
  "shuttle-zone": 8,
  "no-aux-vehicles": 7,
  "no-rvs": 6,
  "direct-follow-mandatory": 5,
  "altitude-pass": 4,
  "leapfrog-daytime": 3,
  "tz-change": 2,
  "no-services": 1,
};
function dominantFlag(flags: SectionFlag[] | undefined): SectionFlag | null {
  if (!flags || flags.length === 0) return null;
  return flags.reduce((best, f) =>
    FLAG_RANK[f] > FLAG_RANK[best] ? f : best,
  );
}

export interface RouteMapProps {
  stations: DbTimeStation[];
  /** Current rider position (lat, lng). null = no live fix. */
  current?: { lat: number; lng: number } | null;
  /** Highest TS number passed so far (0-54). Stations ≤ passed = emerald dot. */
  currentTs?: number;
  /** Map container height. */
  height?: string | number;
  /** Fit bounds to route on mount. Default true. */
  fitRoute?: boolean;
  /** Mapbox style. Default: dark-v11. */
  mapStyle?: string;
  /** CSS className for container wrapper. */
  className?: string;
  /** Path to GeoJSON LineString. Default: /raam/route.geojson. */
  routeGeoJsonUrl?: string;
}

export function RouteMap({
  stations,
  current = null,
  currentTs = 0,
  height = 440,
  fitRoute = true,
  mapStyle = "mapbox://styles/mapbox/dark-v11",
  className,
  routeGeoJsonUrl = "/raam/route.geojson",
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Stations with valid coords — map breaks if any null.
  const geo = stations
    .filter((s) => s.lat !== null && s.lng !== null)
    .map((s) => ({
      ts: s.ts_num,
      name: s.name,
      state: s.state,
      lng: Number(s.lng),
      lat: Number(s.lat),
      mile: Number(s.mile_total),
      flags: (s.flags ?? []) as SectionFlag[],
    }));

  useEffect(() => {
    if (!token) return;
    if (!containerRef.current) return;
    if (geo.length < 2) return;
    if (mapRef.current) return; // already initialized

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [geo[0].lng, geo[0].lat],
      zoom: 4,
      attributionControl: false,
      cooperativeGestures: true,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right",
    );
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.on("load", async () => {
      // Try real GPX-derived polyline first; fall back to straight lines between TS.
      let routeData:
        | GeoJSON.Feature<GeoJSON.LineString>
        | GeoJSON.FeatureCollection<GeoJSON.LineString>;
      try {
        const res = await fetch(routeGeoJsonUrl);
        if (res.ok) {
          routeData = (await res.json()) as typeof routeData;
        } else {
          throw new Error(`status ${res.status}`);
        }
      } catch {
        routeData = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: geo.map((g) => [g.lng, g.lat]),
          },
        };
      }
      map.addSource("raam-route", {
        type: "geojson",
        data: routeData,
      });

      // Glow underlay
      map.addLayer({
        id: "raam-route-glow",
        type: "line",
        source: "raam-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#fc4c02",
          "line-width": 10,
          "line-opacity": 0.18,
        },
      });
      // Main route
      map.addLayer({
        id: "raam-route-line",
        type: "line",
        source: "raam-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#fc4c02",
          "line-width": 2.5,
          "line-opacity": 0.95,
        },
      });

      // TS markers — color follows dominant section flag if present, else
      // emerald for passed and zinc for upcoming.
      for (const g of geo) {
        const passed = g.ts <= currentTs;
        const flag = dominantFlag(g.flags);
        const ringColor = flag ? FLAG_COLOR[flag] : null;
        const fill = passed ? "#34d399" : "#71717a";
        const el = document.createElement("div");
        el.className = "raam-ts-marker";
        el.style.cssText = [
          "width: 14px",
          "height: 14px",
          "border-radius: 50%",
          "border: 2px solid #09090b",
          `background: ${fill}`,
          ringColor
            ? `box-shadow: 0 0 0 2px ${ringColor}, 0 0 0 3px rgba(255,255,255,0.18)`
            : "box-shadow: 0 0 0 1px rgba(255,255,255,0.15)",
          "cursor: pointer",
        ].join(";");
        const flagsBadgeHtml = (g.flags ?? [])
          .map(
            (f) =>
              `<span style="display:inline-block;margin:2px 4px 0 0;padding:1px 5px;border-radius:8px;background:${FLAG_COLOR[f]};color:#09090b;font-size:9px;font-weight:600">${f}</span>`,
          )
          .join("");
        const popup = new mapboxgl.Popup({
          offset: 14,
          closeButton: false,
        }).setHTML(
          `<div style="font-family:ui-sans-serif;font-size:11px;color:#09090b">
             <div style="font-weight:700">TS${g.ts} · ${g.name}, ${g.state}</div>
             <div style="font-family:ui-monospace;font-size:10px;color:#71717a;margin-top:2px">
               mi ${g.mile.toFixed(1)}
             </div>
             ${flagsBadgeHtml ? `<div style="margin-top:4px">${flagsBadgeHtml}</div>` : ""}
           </div>`,
        );
        new mapboxgl.Marker(el)
          .setLngLat([g.lng, g.lat])
          .setPopup(popup)
          .addTo(map);
      }

      // Current position — pulsing orange dot
      if (current) {
        const el = document.createElement("div");
        el.className = "raam-rider-marker";
        el.style.cssText = [
          "width: 20px",
          "height: 20px",
          "border-radius: 50%",
          "background: #fc4c02",
          "border: 3px solid #fff",
          "box-shadow: 0 0 0 0 rgba(252,76,2,0.8)",
          "animation: raam-rider-pulse 1.6s cubic-bezier(0.16,1,0.3,1) infinite",
        ].join(";");
        new mapboxgl.Marker(el)
          .setLngLat([current.lng, current.lat])
          .addTo(map);
      }

      if (fitRoute) {
        const bounds = new mapboxgl.LngLatBounds();
        for (const g of geo) bounds.extend([g.lng, g.lat]);
        if (current) bounds.extend([current.lng, current.lat]);
        map.fitBounds(bounds, { padding: 40, duration: 0 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-amber-900/60 bg-amber-500/10 text-[12px] text-amber-300"
        style={{ height }}
      >
        NEXT_PUBLIC_MAPBOX_TOKEN missing in .env.local
      </div>
    );
  }

  // Build a legend showing which section flags are actually present in this set
  // of stations. Hides flags that don't appear (no clutter).
  const presentFlags = new Set<SectionFlag>();
  for (const s of stations) {
    for (const f of (s.flags ?? []) as SectionFlag[]) presentFlags.add(f);
  }

  return (
    <>
      <style jsx global>{`
        @keyframes raam-rider-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(252, 76, 2, 0.7);
          }
          50% {
            box-shadow: 0 0 0 14px rgba(252, 76, 2, 0);
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className={className}
        style={{ width: "100%", height }}
      />
      {presentFlags.size > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
          <span className="text-zinc-500">Section flags:</span>
          {Array.from(presentFlags)
            .sort((a, b) => FLAG_RANK[b] - FLAG_RANK[a])
            .map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: FLAG_COLOR[f] }}
                />
                {f}
              </span>
            ))}
        </div>
      )}
    </>
  );
}
