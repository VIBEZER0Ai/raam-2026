import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TopNav } from "@/components/chrome/top-nav";
import { FooterBar } from "@/components/chrome/footer-bar";
import { PublicHeader } from "@/components/chrome/public-header";
import { getCurrentUser } from "@/lib/auth/session";
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
  // Signed-out visitors get the lightweight marketing header.
  // Authenticated users get the race-ops chrome (TopNav + race-stats FooterBar).
  const isPublicMarketing = !user;

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
            <TopNav userEmail={user?.email ?? null} />
          )}
          <main
            className={
              isPublicMarketing
                ? "mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-3 pt-3 sm:px-5 sm:pt-4"
                : "mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-3 pb-[140px] pt-3 sm:px-5 sm:pt-4 sm:pb-[120px]"
            }
          >
            {children}
          </main>
          {!isPublicMarketing && <FooterBar />}
        </div>
      </body>
    </html>
  );
}
