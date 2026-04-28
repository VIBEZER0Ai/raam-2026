"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  Pause,
  Play,
  Send,
  TriangleAlert,
  Truck,
} from "lucide-react";

interface TrackerProps {
  vehicle: {
    id: string;
    callSign: string;
    kind: "follow" | "leapfrog" | "aux" | "rv" | "media";
  };
  crew: { id: string; name: string }[];
}

interface PingState {
  ts: number;
  lat: number;
  lng: number;
  speed_mph?: number;
  heading?: number;
  status: "ok" | "fail" | "queued";
  error?: string;
}

const PING_INTERVAL_MS = 30_000;
const KMH_TO_MPH = 0.621371;

export function Tracker({ vehicle, crew }: TrackerProps) {
  const [running, setRunning] = useState(false);
  const [permission, setPermission] = useState<
    "unknown" | "prompt" | "granted" | "denied"
  >("unknown");
  const [last, setLast] = useState<PingState | null>(null);
  const [history, setHistory] = useState<PingState[]>([]);
  const [driver, setDriver] = useState<string>("");
  const [navigator_, setNavigator] = useState<string>("");
  const [fatal, setFatal] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);
  const latestPosRef = useRef<GeolocationPosition | null>(null);

  // Surface permission state on mount (best-effort, not all browsers expose it).
  useEffect(() => {
    const nav = window.navigator as Navigator & {
      permissions?: {
        query: (q: { name: string }) => Promise<PermissionStatus>;
      };
    };
    nav.permissions
      ?.query({ name: "geolocation" })
      .then((p) => setPermission(p.state as typeof permission))
      .catch(() => undefined);
  }, []);

  // Stop watch on unmount or pause.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const sendPing = async (p: GeolocationPosition) => {
    const speedMph =
      typeof p.coords.speed === "number" && p.coords.speed >= 0
        ? p.coords.speed * 3.6 * KMH_TO_MPH // m/s → kph → mph
        : undefined;
    const ping: PingState = {
      ts: Date.now(),
      lat: p.coords.latitude,
      lng: p.coords.longitude,
      speed_mph: speedMph,
      heading:
        typeof p.coords.heading === "number" && !Number.isNaN(p.coords.heading)
          ? p.coords.heading
          : undefined,
      status: "queued",
    };
    setLast(ping);
    try {
      const res = await fetch("/api/vehicle/ping", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          lat: ping.lat,
          lng: ping.lng,
          speed_mph: ping.speed_mph,
          heading: ping.heading,
          source: "phone",
          driver_crew_id: driver || undefined,
          navigator_crew_id: navigator_ || undefined,
        }),
      });
      const ok = res.ok;
      const errBody = ok ? null : await res.text().catch(() => res.statusText);
      const finalPing: PingState = {
        ...ping,
        status: ok ? "ok" : "fail",
        error: ok ? undefined : errBody ?? `HTTP ${res.status}`,
      };
      setLast(finalPing);
      setHistory((h) => [finalPing, ...h].slice(0, 20));
      lastSentRef.current = Date.now();
    } catch (e) {
      const finalPing: PingState = {
        ...ping,
        status: "fail",
        error: e instanceof Error ? e.message : String(e),
      };
      setLast(finalPing);
      setHistory((h) => [finalPing, ...h].slice(0, 20));
    }
  };

  const start = () => {
    if (!("geolocation" in navigator)) {
      setFatal("This device has no geolocation API.");
      return;
    }
    setRunning(true);
    setFatal(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        latestPosRef.current = pos;
        // Throttle: send at most once per PING_INTERVAL_MS.
        if (Date.now() - lastSentRef.current >= PING_INTERVAL_MS) {
          sendPing(pos);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermission("denied");
          setFatal(
            "Geolocation permission denied. Open device settings and re-enable for this site, then reload.",
          );
          stop();
        } else {
          setFatal(`Geo error: ${err.message}`);
        }
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    );

    // Also fire a fixed-interval ping in case watchPosition idles.
    intervalRef.current = window.setInterval(() => {
      const p = latestPosRef.current;
      if (p && Date.now() - lastSentRef.current >= PING_INTERVAL_MS) {
        sendPing(p);
      }
    }, PING_INTERVAL_MS);
  };
  const intervalRef = useRef<number | null>(null);

  const stop = () => {
    setRunning(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const sendOnce = () => {
    if (!latestPosRef.current) {
      navigator.geolocation.getCurrentPosition(
        (p) => sendPing(p),
        (err) => setFatal(`Geo error: ${err.message}`),
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    } else {
      sendPing(latestPosRef.current);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHead
          left={
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[color:var(--fg-3)]" />
              Tracking · {vehicle.callSign}
            </span>
          }
          right={
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--fg-3)]">
              {vehicle.kind}
            </span>
          }
        />
        <CardBody>
          <div className="text-[13px] text-[color:var(--fg-2)]">
            Open this page on the on-duty crew phone. Tap{" "}
            <span className="font-bold text-[color:var(--fg-1)]">Start</span>{" "}
            and grant location permission. Pings every 30 s while the tab is
            open. Add to home screen for native-feel persistence.
          </div>

          {permission === "denied" && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-700 bg-red-500/10 p-3 text-[12px] text-red-200">
              <TriangleAlert className="h-4 w-4 flex-shrink-0 text-red-400" />
              <div>
                Location permission denied. iOS: Settings → Safari → Location.
                Android Chrome: lock icon → Permissions → Location.
              </div>
            </div>
          )}

          {fatal && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-700 bg-amber-500/10 p-3 text-[12px] text-amber-200">
              <TriangleAlert className="h-4 w-4 flex-shrink-0 text-amber-400" />
              <div>{fatal}</div>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
              Driver
              <select
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] font-semibold text-[color:var(--fg-1)] focus:border-[color:var(--border-strong)] focus:outline-none"
              >
                <option value="">(not set)</option>
                {crew.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
              Navigator
              <select
                value={navigator_}
                onChange={(e) => setNavigator(e.target.value)}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] font-semibold text-[color:var(--fg-1)] focus:border-[color:var(--border-strong)] focus:outline-none"
              >
                <option value="">(not set)</option>
                {crew.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {running ? (
              <button
                type="button"
                onClick={stop}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-white hover:bg-red-600"
              >
                <Pause className="h-4 w-4" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                className="flex items-center gap-2 rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-white hover:opacity-90"
              >
                <Play className="h-4 w-4" />
                Start tracking
              </button>
            )}
            <button
              type="button"
              onClick={sendOnce}
              className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-2)] hover:border-[color:var(--border-strong)]"
            >
              <Send className="h-4 w-4" />
              Send ping now
            </button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHead
          left={
            <span className="flex items-center gap-2">
              <Activity
                className={cn(
                  "h-4 w-4",
                  running ? "text-emerald-400" : "text-[color:var(--fg-4)]",
                )}
              />
              Live
            </span>
          }
          right={running ? "running · 30 s loop" : "paused"}
        />
        <CardBody>
          {last ? (
            <div className="grid grid-cols-2 gap-3 font-mono text-[12px] sm:grid-cols-4">
              <Cell
                label="Lat"
                value={last.lat.toFixed(5)}
              />
              <Cell
                label="Lng"
                value={last.lng.toFixed(5)}
              />
              <Cell
                label="Speed mph"
                value={
                  last.speed_mph !== undefined
                    ? last.speed_mph.toFixed(1)
                    : "—"
                }
              />
              <Cell
                label="Status"
                value={last.status}
                tone={
                  last.status === "ok"
                    ? "good"
                    : last.status === "fail"
                    ? "bad"
                    : "neutral"
                }
              />
            </div>
          ) : (
            <div className="text-[12px] text-[color:var(--fg-4)]">
              No ping sent yet.
            </div>
          )}
          {last?.error && (
            <div className="mt-2 font-mono text-[11px] text-red-400">
              {last.error}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHead left="Recent pings" right={`${history.length} · last 20`} />
        <div className="flex flex-col">
          {history.length === 0 && (
            <div className="px-4 py-3 text-[12px] text-[color:var(--fg-4)]">
              History will appear here as pings post.
            </div>
          )}
          {history.map((p) => (
            <div
              key={p.ts}
              className="flex items-center justify-between gap-2 border-b border-[color:var(--border-soft)] px-4 py-2 font-mono text-[11px] last:border-b-0"
            >
              <span className="text-[color:var(--fg-3)]">
                {new Date(p.ts).toLocaleTimeString()}
              </span>
              <span className="truncate text-[color:var(--fg-1)]">
                {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
              </span>
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase",
                  p.status === "ok"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : p.status === "fail"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-zinc-500/20 text-zinc-400",
                )}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
      ? "text-red-400"
      : "text-[color:var(--fg-1)]";
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
        {label}
      </div>
      <div className={cn("mt-0.5", toneClass)}>{value}</div>
    </div>
  );
}
