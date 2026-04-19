/** Milliseconds from now to ISO `to`. Clamped to 0. */
export function msDiff(to: string | Date): number {
  return Math.max(0, new Date(to).getTime() - Date.now());
}

/** Break a duration in ms into days/hours/min/sec. */
export function fmtDHMS(ms: number) {
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { d, h, m, s };
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Format elapsed ms from a start time (for "since start" counters). */
export function elapsedSince(startIso: string): ReturnType<typeof fmtDHMS> {
  const ms = Math.max(0, Date.now() - new Date(startIso).getTime());
  return fmtDHMS(ms);
}
