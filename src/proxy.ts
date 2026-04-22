import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Match all paths except Next.js internals + static assets.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|raam/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
