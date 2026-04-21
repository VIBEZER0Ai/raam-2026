"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

export interface SendLinkInput {
  email: string;
  next?: string;
}

export async function sendMagicLink(
  input: SendLinkInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email" };
  }

  // Crew allowlist — only emails matching an active crew_member row may sign in.
  // Falsy SUPABASE_SERVICE_ROLE_KEY = bootstrap mode, allow all (first admin signs in).
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("crew_member")
        .select("id")
        .eq("active", true)
        .ilike("email", email)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("[sendMagicLink allowlist]", error);
        return { ok: false, error: "Server error — try again." };
      }
      if (!data) {
        return {
          ok: false,
          error: "Email not on crew roster. Ask Sapna or Vishal to add you.",
        };
      }
    } catch (e) {
      console.error("[sendMagicLink allowlist]", e);
      return { ok: false, error: "Server error — try again." };
    }
  }

  const supabase = await createClient();
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  const next = input.next && input.next.startsWith("/") ? input.next : "/";
  const redirectTo = `${proto}://${host}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });
  if (error) {
    console.error("[sendMagicLink]", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
