import { createClient } from "@/lib/supabase/server";

/**
 * Read the current user on the server. Returns null if not authenticated.
 * Safe for Server Components, Server Actions, Route Handlers.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication. Throws if not authed (server actions should catch).
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
