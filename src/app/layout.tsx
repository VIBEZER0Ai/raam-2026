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
  title: "Team Kabir · RAAM 2026 C&C",
  description:
    "Race Across America 2026 Command & Control for Coach Kabir Rachure (#610, Solo Men). Oceanside → Atlantic City · 3,068 mi · 54 Time Stations.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "RAAM 2026",
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
          <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-4 px-5 pb-[120px] pt-4">
            {children}
          </main>
          <FooterBar />
        </div>
      </body>
    </html>
  );
}
