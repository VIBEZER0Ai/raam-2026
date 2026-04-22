/**
 * GET /api/whoop/connect?crew_member_id=<uuid>
 *
 * Redirects to Whoop authorize URL. State carries the crew_member_id
 * (+ a random nonce) so the callback can associate the token with the
 * right crew row.
 */

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildAuthorizeUrl } from "@/lib/whoop/client";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const crewMemberId = url.searchParams.get("crew_member_id") ?? "";
  if (!crewMemberId) {
    return NextResponse.json(
      { error: "crew_member_id query param required" },
      { status: 400 },
    );
  }

  const nonce = randomUUID();
  const state = Buffer.from(
    JSON.stringify({ crew_member_id: crewMemberId, nonce }),
  ).toString("base64url");

  try {
    const authorize = buildAuthorizeUrl(state);
    const res = NextResponse.redirect(authorize);
    res.cookies.set("whoop_oauth_state", nonce, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : String(e),
        hint: "Set WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET / WHOOP_REDIRECT_URI in Vercel env",
      },
      { status: 500 },
    );
  }
}
