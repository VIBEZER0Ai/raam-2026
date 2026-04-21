"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { DbTimeStation } from "@/lib/db/queries";

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
}

export function RouteMap({
  stations,
  current = null,
  currentTs = 0,
  height = 440,
  fitRoute = true,
  mapStyle = "mapbox://styles/mapbox/dark-v11",
  className,
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

    map.on("load", () => {
      // Route line
      map.addSource("raam-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: geo.map((g) => [g.lng, g.lat]),
          },
        },
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

      // TS markers
      for (const g of geo) {
        const passed = g.ts <= currentTs;
        const el = document.createElement("div");
        el.className = "raam-ts-marker";
        el.style.cssText = [
          "width: 14px",
          "height: 14px",
          "border-radius: 50%",
          "border: 2px solid #09090b",
          `background: ${passed ? "#34d399" : "#71717a"}`,
          "box-shadow: 0 0 0 1px rgba(255,255,255,0.15)",
          "cursor: pointer",
        ].join(";");
        const popup = new mapboxgl.Popup({
          offset: 14,
          closeButton: false,
        }).setHTML(
          `<div style="font-family:ui-sans-serif;font-size:11px;color:#09090b">
             <div style="font-weight:700">TS${g.ts} · ${g.name}, ${g.state}</div>
             <div style="font-family:ui-monospace;font-size:10px;color:#71717a;margin-top:2px">
               mi ${g.mile.toFixed(1)}
             </div>
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
    </>
  );
}
