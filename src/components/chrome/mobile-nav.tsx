"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_GROUPS, NAV_PRIMARY } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Mobile slide-down drawer nav. Hamburger trigger visible only on <md
 * screens. Inside: War Room primary + 3 grouped sections (Operate /
 * Plan / Team) mirroring the desktop GroupedNav.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isItemActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
            className="fixed left-0 right-0 top-[60px] max-h-[calc(100vh-60px)] overflow-y-auto border-b border-[color:var(--border)] bg-[color:var(--bg-elev)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-[1440px] px-4 py-3">
              {/* War Room primary */}
              <Link
                href={NAV_PRIMARY.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-[52px] flex-col justify-center rounded-xl px-4 py-2.5 text-[15px] font-extrabold",
                  isItemActive(NAV_PRIMARY.href)
                    ? "bg-[color:var(--strava-orange)] text-white"
                    : "border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--fg-1)]",
                )}
              >
                {NAV_PRIMARY.label}
                <span className="mt-0.5 text-[11px] font-normal opacity-80">
                  {NAV_PRIMARY.desc}
                </span>
              </Link>

              {NAV_GROUPS.map((g) => (
                <section key={g.id} className="mt-4">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--fg-4)]">
                    {g.label}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {g.items.map((it) => {
                      const active = isItemActive(it.href);
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "min-h-[54px] rounded-lg px-3 py-2.5 text-left",
                            active
                              ? "bg-[color:var(--strava-orange)] text-white"
                              : "border border-[color:var(--border)] bg-[color:var(--bg)]",
                          )}
                        >
                          <span className="block text-[14px] font-extrabold">
                            {it.label}
                          </span>
                          {it.desc && (
                            <span
                              className={cn(
                                "mt-0.5 block text-[11px] font-normal",
                                active
                                  ? "opacity-80"
                                  : "text-[color:var(--fg-4)]",
                              )}
                            >
                              {it.desc}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
