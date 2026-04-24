import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TopNav } from "@/components/chrome/top-nav";
import { FooterBar } from "@/components/chrome/footer-bar";
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
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full`}>
      <body
        className="min-h-full"
        style={{
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        }}
      >
        <div className="flex min-h-screen flex-col">
          <TopNav userEmail={user?.email ?? null} />
          <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-3 pb-[140px] pt-3 sm:px-5 sm:pt-4 sm:pb-[120px]">
            {children}
          </main>
          <FooterBar />
        </div>
      </body>
    </html>
  );
}
