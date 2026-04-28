/**
 * Race elapsed timer — single source of truth for "how long has Kabir been racing".
 *
 * Race time = Eastern Daylight Time per RAAM rules. The race officially starts
 * 2026-06-16 12:00 PDT == 15:00 EDT. Cutoff for Solo Men Under 50 is 288 hours
 * (12 days), so the hard cutoff is 2026-06-29 15:00 EDT.
 *
 * All callers should use this module rather than computing elapsed time on
 * their own. Time-zone changes during the race (Mountain → Central → Eastern)
 * do not affect race time — race time stays in EDT throughout.
 */

import { RACE } from "./race-config";

export type RaceState = "pre" | "live" | "finished" | "cutoff";

/** Race start as a UTC instant — does not change across time zones. */
export const RACE_START_MS = new Date(RACE.start.datetime_utc).getTime();
/** Race hard cutoff as a UTC instant — solo men under 50 = 288h. */
export const RACE_CUTOFF_MS = new Date(RACE.finish.hard_cutoff_utc).getTime();

/** Milliseconds between race start and `now` (negative if not started). */
export function elapsedMs(now: number = Date.now()): number {
  return now - RACE_START_MS;
}

/** Race state at `now`. `finishedAt` overrides — pass when rider crosses line. */
export function raceState(
  now: number = Date.now(),
  finishedAt: number | null = null,
): RaceState {
  if (finishedAt !== null && finishedAt <= now) return "finished";
  if (now < RACE_START_MS) return "pre";
  if (now > RACE_CUTOFF_MS) return "cutoff";
  return "live";
}

export interface ElapsedParts {
  /** Whole days elapsed since race start. Negative before start. */
  days: number;
  /** 0–23 hours within the current race day. */
  hours: number;
  /** 0–59 minutes within the current hour. */
  minutes: number;
  /** 0–59 seconds within the current minute. */
  seconds: number;
  /** Total whole hours from start (cumulative). Useful for cutoff math. */
  totalHours: number;
  /** Negative if before race start. */
  isPreRace: boolean;
}

/** Decompose ms-since-start into d/h/m/s components. Handles negatives. */
export function elapsedParts(ms: number): ElapsedParts {
  const isPreRace = ms < 0;
  const abs = Math.abs(ms);
  const totalSec = Math.floor(abs / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const minutes = totalMin % 60;
  const totalHr = Math.floor(totalMin / 60);
  const hours = totalHr % 24;
  const days = Math.floor(totalHr / 24);
  return {
    days: isPreRace ? -days : days,
    hours,
    minutes,
    seconds,
    totalHours: isPreRace ? -totalHr : totalHr,
    isPreRace,
  };
}

/** Compact format: "3d 14h 22m" or "T-2d 5h 14m" pre-race. Drops seconds. */
export function formatElapsed(ms: number): string {
  const p = elapsedParts(ms);
  if (p.isPreRace) {
    return `T-${Math.abs(p.days)}d ${p.hours}h ${p.minutes}m`;
  }
  return `${p.days}d ${p.hours}h ${p.minutes}m`;
}

/** Long format with seconds: "3d 14:22:07". Use for War Room hero clock. */
export function formatElapsedLong(ms: number): string {
  const p = elapsedParts(ms);
  const hh = String(p.hours).padStart(2, "0");
  const mm = String(p.minutes).padStart(2, "0");
  const ss = String(p.seconds).padStart(2, "0");
  if (p.isPreRace) {
    return `T-${Math.abs(p.days)}d ${hh}:${mm}:${ss}`;
  }
  return `${p.days}d ${hh}:${mm}:${ss}`;
}

/** Format absolute time in race timezone (EDT) — no tz drift. */
export function formatRaceTimeEDT(ms: number): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: RACE.course.official_race_time_tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

/** Hours remaining until cutoff. Negative if past cutoff. */
export function hoursUntilCutoff(now: number = Date.now()): number {
  return (RACE_CUTOFF_MS - now) / 3_600_000;
}
