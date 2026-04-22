import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session-refreshing middleware helper for Supabase SSR.
 *
 * Public routes (no session required):
 *   /login, /auth/*, /spectator, /api/gps/ping, /_next/*, /raam/*, /favicon.ico
 *
 * Everything else redirects to /login if no user.
 */
const PUBLIC_PREFIXES = [
  "/login",
  "/auth",
  "/spectator",
  "/api/gps/ping",
  "/api/discord/inbound",
  "/api/cron",
  "/api/whoop/callback",
  "/privacy",
  "/terms",
  "/_next",
  "/raam",
  "/favicon",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
