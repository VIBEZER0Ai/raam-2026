"use server";

import { createClient } from "@/lib/supabase/server";
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
