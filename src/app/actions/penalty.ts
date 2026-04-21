"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface LogPenaltyInput {
  kind: "warning" | "penalty_1h" | "dq";
  rule_ref?: string;
  description: string;
  issued_by?: string;
  ts_num?: number;
}

export async function logPenalty(
  input: LogPenaltyInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase.from("penalty").insert({
    kind: input.kind,
    rule_ref: input.rule_ref ?? null,
    description: input.description,
    issued_by: input.issued_by ?? null,
    ts_num: input.ts_num ?? null,
  });
  if (error) {
    console.error("[logPenalty]", error);
    return { ok: false, error: error.message };
  }
  revalidatePath("/compliance");
  revalidatePath("/");
  return { ok: true };
}

export async function resolvePenalty(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("penalty")
    .update({ resolved: true })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/compliance");
  return { ok: true };
}
