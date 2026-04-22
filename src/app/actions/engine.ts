"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { runRuleEngine, type RunnerSummary } from "@/lib/raam/rule-runner";

export async function runEngineNow(): Promise<
  { ok: true; summary: RunnerSummary } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  try {
    const summary = await runRuleEngine();
    revalidatePath("/compliance");
    revalidatePath("/comms");
    return { ok: true, summary };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
