"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavTab {
  href: string;
  label: string;
  group: string;
}

/**
 * Mobile-only slide-down drawer nav. Triggered by a hamburger button
 * in the top-nav. Lists every tab as a tappable row with generous
 * 48px targets. Hidden on md+ (desktop shows pill bar instead).
 */
export function MobileNav({ tabs }: { tabs: NavTab[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeHref = tabs.find((t) =>
    t.href === "/" ? pathname === "/" : pathname.startsWith(t.href),
  )?.href;

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] md:hidden"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[55] bg-[color:var(--bg)]/92 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="fixed left-0 right-0 top-[60px] border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-[1440px] px-4 py-3">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
                Live
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {tabs
                  .filter((t) => t.group === "live")
                  .map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "min-h-[48px] rounded-lg px-4 py-3 text-[14px] font-semibold",
                        t.href === activeHref
                          ? "bg-[color:var(--strava-orange)] text-white"
                          : "border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--fg-1)]",
                      )}
                    >
                      {t.label}
                    </Link>
                  ))}
              </div>

              <div className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
                Lifecycle
              </div>
              <div className="grid grid-cols-2 gap-1.5 pb-3">
                {tabs
                  .filter((t) => t.group === "lifecycle")
                  .map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "min-h-[48px] rounded-lg px-4 py-3 text-[14px] font-semibold",
                        t.href === activeHref
                          ? "bg-[color:var(--strava-orange)] text-white"
                          : "border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--fg-1)]",
                      )}
                    >
                      {t.label}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
