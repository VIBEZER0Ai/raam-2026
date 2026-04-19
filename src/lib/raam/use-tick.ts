"use client";

import { useEffect, useState } from "react";

/** Force re-render every `ms` milliseconds. Used by live clocks + countdowns. */
export function useTick(ms = 1000) {
  const [, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}
