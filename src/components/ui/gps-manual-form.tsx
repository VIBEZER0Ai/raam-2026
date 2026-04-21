"use client";

import { useState, useTransition } from "react";
import { manualPing } from "@/app/actions/gps";
import { cn } from "@/lib/utils";

export function GpsManualForm() {
  const [pending, startTransition] = useTransition();
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [speed, setSpeed] = useState("");
  const [mile, setMile] = useState("");
  const [state, setState] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const submit = () => {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) {
      setResult("lat and lng required");
      return;
    }
    startTransition(async () => {
      setResult(null);
      const res = await manualPing({
        lat: la,
        lng: ln,
        speed_mph: speed ? Number(speed) : undefined,
        mile_from_start: mile ? Number(mile) : undefined,
        state: state.trim() || undefined,
        note: note.trim() || undefined,
      });
      if (res.ok) {
        setResult("Ping logged.");
        setLat("");
        setLng("");
        setSpeed("");
        setMile("");
        setState("");
        setNote("");
        setTimeout(() => setResult(null), 2000);
      } else {
        setResult(`Error: ${res.error}`);
      }
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setResult("Browser does not support geolocation");
      return;
    }
    setResult("Fetching location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        if (pos.coords.speed !== null && pos.coords.speed !== undefined) {
          setSpeed((pos.coords.speed * 2.23694).toFixed(1));
        }
        setResult(null);
      },
      (err) => setResult(`Geo error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev-alpha)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--fg-3)]">
          Log GPS ping manually
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] font-semibold text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]"
        >
          Use my location
        </button>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
        <input
          type="number"
          step="any"
          placeholder="Speed (mph)"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
        <input
          type="number"
          step="any"
          placeholder="Mile from start"
          value={mile}
          onChange={(e) => setMile(e.target.value)}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
        <input
          type="text"
          placeholder="State (CA, AZ, UT, CO...)"
          maxLength={2}
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase())}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 font-mono text-[13px] uppercase text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] text-[color:var(--fg)] focus:border-[color:var(--strava-orange)] focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={cn(
            "rounded-lg bg-[color:var(--strava-orange)] px-4 py-2 text-[13px] font-bold text-white transition-opacity",
            pending && "opacity-50",
          )}
        >
          {pending ? "Logging…" : "Log ping"}
        </button>
        {result && (
          <span
            className={cn(
              "font-mono text-[11px]",
              result.startsWith("Error") || result.startsWith("Geo")
                ? "text-red-400"
                : "text-emerald-400",
            )}
          >
            {result}
          </span>
        )}
      </div>
    </div>
  );
}
