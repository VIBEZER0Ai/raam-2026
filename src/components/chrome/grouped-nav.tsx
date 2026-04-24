"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  NAV_GROUPS,
  NAV_PRIMARY,
  findActiveGroup,
  findActiveItem,
  type NavGroup,
} from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Desktop navigation (md+).
 * Layout:  [War Room]  [Operate ▾]  [Plan ▾]  [Team ▾]
 *
 * One pill button per entry. Clicking a dropdown toggles its panel.
 * Clicking outside or Escape closes.
 *
 * Mobile (<md) is handled by <MobileNav /> — this component renders
 * `hidden md:flex`.
 */
export function GroupedNav() {
  const pathname = usePathname();
  const [openGroupId, setOpenGroupId] = useState<NavGroup["id"] | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const activeGroup = findActiveGroup(pathname);
  const activeItem = findActiveItem(pathname);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenGroupId(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroupId(null);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setOpenGroupId(null);
  }, [pathname]);

  const isPrimaryActive = pathname === "/";

  return (
    <div ref={rootRef} className="hidden items-center gap-1 md:flex">
      <Link
        href={NAV_PRIMARY.href}
        className={cn(
          "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
          isPrimaryActive
            ? "bg-[color:var(--strava-orange)] text-white"
            : "text-[color:var(--fg-2)] hover:text-[color:var(--fg-1)]",
        )}
      >
        {NAV_PRIMARY.label}
      </Link>

      {NAV_GROUPS.map((g) => {
        const isGroupActive = activeGroup?.id === g.id;
        const open = openGroupId === g.id;
        return (
          <div key={g.id} className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenGroupId((prev) => (prev === g.id ? null : g.id))
              }
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                isGroupActive
                  ? "bg-[color:var(--bg-row)] text-[color:var(--fg-1)]"
                  : "text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]",
              )}
              aria-expanded={open}
              aria-haspopup="true"
            >
              {g.label}
              {isGroupActive && activeItem && activeItem.href !== "/" && (
                <span className="ml-1 hidden text-[10px] font-normal text-[color:var(--fg-4)] lg:inline">
                  · {activeItem.label}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>

            {open && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[260px] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
                  {g.label}
                </div>
                <div className="flex flex-col pb-1.5">
                  {g.items.map((it) => {
                    const isActive =
                      activeItem?.href === it.href &&
                      (it.href !== "/" || pathname === "/");
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        onClick={() => setOpenGroupId(null)}
                        className={cn(
                          "flex flex-col px-3 py-2 text-[13px] transition-colors",
                          isActive
                            ? "bg-[color:var(--strava-orange)]/10 text-[color:var(--fg-1)]"
                            : "hover:bg-[color:var(--bg-row)]",
                        )}
                      >
                        <span className="font-semibold">{it.label}</span>
                        {it.desc && (
                          <span className="mt-0.5 text-[11px] text-[color:var(--fg-4)]">
                            {it.desc}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
