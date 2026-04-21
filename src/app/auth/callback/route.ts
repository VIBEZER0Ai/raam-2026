import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Supabase auth callback.
 *
 * Handles two flows:
 *   - Magic link / email OTP: ?token_hash=...&type=magiclink|email|recovery|invite
 *   - OAuth / PKCE:           ?code=...
 *
 * Exchanges the token for a session, then redirects to ?next or /.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const dest = next.startsWith("/") ? next : "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${url.origin}${dest}`);
    }
    console.error("[auth/callback verifyOtp]", error);
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${url.origin}${dest}`);
    }
    console.error("[auth/callback exchangeCode]", error);
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${url.origin}/login?error=missing_token`);
}
