/**
 * GET /api/whoop/callback?code=...&state=...
 *
 * Exchange OAuth code → tokens, store in whoop_token, then kick off an
 * immediate sync so the UI has data on first paint.
 */

import { NextResponse } from "next/server";
import { exchangeCode, fetchProfile } from "@/lib/whoop/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { runWhoopSync } from "@/lib/whoop/sync";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  if (!code || !stateRaw) {
    return NextResponse.json({ error: "missing code/state" }, { status: 400 });
  }

  let parsed: { crew_member_id: string; nonce: string };
  try {
    parsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
  } catch {
    return NextResponse.json({ error: "bad state" }, { status: 400 });
  }

  const cookieNonce = req.headers
    .get("cookie")
    ?.match(/whoop_oauth_state=([^;]+)/)?.[1];
  if (!cookieNonce || cookieNonce !== parsed.nonce) {
    return NextResponse.json(
      { error: "state/nonce mismatch (CSRF guard)" },
      { status: 400 },
    );
  }

  try {
    const tokens = await exchangeCode(code);
    const profile = await fetchProfile(tokens.access_token);

    const admin = createAdminClient();
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();
    const { error } = await admin.from("whoop_token").upsert(
      {
        crew_member_id: parsed.crew_member_id,
        whoop_user_id: String(profile.user_id),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "crew_member_id,whoop_user_id" },
    );
    if (error) throw new Error(error.message);

    // Kick off initial backfill (fire-and-forget; 14d window).
    const syncSummary = await runWhoopSync().catch((e) => ({
      error: e instanceof Error ? e.message : String(e),
    }));

    const redirect = new URL(
      `/admin/roster?whoop=connected&user=${profile.first_name}`,
      req.url,
    );
    const res = NextResponse.redirect(redirect);
    res.cookies.set("whoop_oauth_state", "", { path: "/", maxAge: 0 });
    res.headers.set("x-whoop-sync", JSON.stringify(syncSummary));
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
