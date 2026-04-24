import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TopNav } from "@/components/chrome/top-nav";
import { FooterBar } from "@/components/chrome/footer-bar";
import { PublicHeader } from "@/components/chrome/public-header";
import { Breadcrumb } from "@/components/chrome/breadcrumb";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTeams, isPlatformAdmin } from "@/lib/team";
import { createClient } from "@/lib/supabase/server";
import {
  getDerivedRaceState,
  getRecentAlerts,
} from "@/lib/db/queries";
import { RACE } from "@/lib/raam/race-config";
import type { FooterStats } from "@/components/chrome/footer-bar";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ventor · endurance team operations",
  description:
    "Command & Control for ultra-endurance teams and solo athletes — cycling, running, triathlon, bikepacking. Live tracking, rule engine, crew coordination.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ventor",
    statusBarStyle: "black-translucent",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const isPublicMarketing = !user;

  // Gather context for authenticated chrome (account menu + breadcrumb + footer).
  let memberships: Awaited<ReturnType<typeof getUserTeams>> = [];
  let platformAdmin = false;
  let fullName: string | null = null;
  let initials: string | null = null;
  let footerStats: FooterStats | null = null;
  let alertCount = 0;
  if (user) {
    const [mem, admin, derived, alerts] = await Promise.all([
      getUserTeams(),
      isPlatformAdmin(),
      getDerivedRaceState(),
      getRecentAlerts({ limit: 20, openOnly: true }),
    ]);
    memberships = mem;
    platformAdmin = admin;
    alertCount = alerts.filter(
      (a) => a.severity === "CRITICAL" || a.severity === "WARN",
    ).length;
    // Elapsed since race start
    const startMs = new Date(RACE.start.datetime_utc).getTime();
    const nowMs = Date.now();
    const elapsedMs = Math.max(0, nowMs - startMs);
    const elapsedHours = elapsedMs / 3_600_000;
    const d = Math.floor(elapsedHours / 24);
    const h = Math.floor(elapsedHours % 24);
    const m = Math.floor((elapsedMs / 60_000) % 60);
    const elapsedLabel =
      elapsedMs === 0
        ? "—"
        : `${d}d ${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`;
    const avgSpeed =
      elapsedHours > 0 && derived.currentMile > 0
        ? derived.currentMile / elapsedHours
        : 0;
    footerStats = {
      currentMile: derived.currentMile,
      currentTs: derived.currentTs,
      avgSpeed,
      elapsed: elapsedLabel,
      targetDelta: "—", // filled in once target_plan wiring ships (AA5.5)
      totalTs: RACE.course.time_stations ?? 54,
    };
    // Try to resolve display name + initials via crew_member
    const supabase = await createClient();
    const { data: crewRow } = await supabase
      .from("crew_member")
      .select("full_name,initials")
      .or(
        `auth_user_id.eq.${user.id},email.ilike.${user.email}`,
      )
      .maybeSingle();
    if (crewRow) {
      fullName = (crewRow as { full_name?: string | null }).full_name ?? null;
      initials = (crewRow as { initials?: string | null }).initials ?? null;
    }
  }
  const defaultTeam = memberships[0];

  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full`}>
      <body
        className="min-h-full"
        style={{
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        }}
      >
        <div className="flex min-h-screen flex-col">
          {isPublicMarketing ? (
            <PublicHeader />
          ) : (
            <TopNav
              userEmail={user?.email ?? null}
              userFullName={fullName}
              userInitials={initials}
              isPlatformAdmin={platformAdmin}
              alertCount={alertCount}
              currentTeam={
                defaultTeam
                  ? {
                      slug: defaultTeam.team.slug,
                      name: defaultTeam.team.name,
                      role: defaultTeam.role,
                    }
                  : null
              }
              allTeams={memberships.map((m) => ({
                slug: m.team.slug,
                name: m.team.name,
                role: m.role,
              }))}
            />
          )}
          <main
            className={
              isPublicMarketing
                ? "mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-3 pt-3 sm:px-5 sm:pt-4"
                : "mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-3 px-3 pb-[140px] pt-3 sm:px-5 sm:pt-4 sm:pb-[120px]"
            }
          >
            {!isPublicMarketing && (
              <Breadcrumb
                teamName={defaultTeam?.team.name ?? null}
                teamSlug={defaultTeam?.team.slug ?? null}
              />
            )}
            {children}
          </main>
          {!isPublicMarketing && <FooterBar stats={footerStats} />}
        </div>
      </body>
    </html>
  );
}
