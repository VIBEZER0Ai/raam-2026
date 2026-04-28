"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-2)] hover:border-[color:var(--strava-orange)] hover:text-[color:var(--strava-orange)] print:hidden"
    >
      <Printer className="h-3.5 w-3.5" />
      Print / save PDF
    </button>
  );
}
