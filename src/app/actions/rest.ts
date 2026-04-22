"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface StartSleepInput {
  location?: string;
  planned_duration_min?: number;
  notes?: string;
}

export interface EndSleepInput {
  rest_id: string;
  whoop_recovery?: number;
  notes?: string;
}

export interface RecoveryInput {
  recovery_pct: number;
  notes?: string;
}

interface OkResult {
  ok: true;
  id?: string;
}
interface ErrResult {
  ok: false;
  error: string;
}
type Result = OkResult | ErrResult;

/**
 * Start a rest block for the rider. Idempotent —
 * if an open block exists, returns its id rather than creating a duplicate.
 */
export async function startSleep(input: StartSleepInput = {}): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const supabase = await createClient();

  // Check for an open block first
  const { data: open } = await supabase
    .from("rest_log")
    .select("id")
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (open) {
    return { ok: true, id: open.id as string };
  }

  const { data, error } = await supabase
    .from("rest_log")
    .insert({
      started_at: new Date().toISOString(),
      location: input.location ?? null,
      notes: input.planned_duration_min
        ? `planned ${input.planned_duration_min}m${input.notes ? " · " + input.notes : ""}`
        : input.notes ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sleep");
  revalidatePath("/");
  revalidatePath("/compliance");
  return { ok: true, id: data.id as string };
}

/**
 * End a rest block and optionally record Whoop recovery %.
 */
export async function endSleep(input: EndSleepInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const supabase = await createClient();
  const patch: Record<string, unknown> = {
    ended_at: new Date().toISOString(),
  };
  if (typeof input.whoop_recovery === "number") {
    patch.whoop_recovery = Math.max(0, Math.min(100, input.whoop_recovery));
  }
  if (input.notes) patch.notes = input.notes;

  const { error } = await supabase
    .from("rest_log")
    .update(patch)
    .eq("id", input.rest_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sleep");
  revalidatePath("/");
  revalidatePath("/compliance");
  return { ok: true, id: input.rest_id };
}

/**
 * End the most recent open block. Used by the big wake button when the
 * caller doesn't know the block id.
 */
export async function endLatestOpenBlock(
  recovery_pct?: number,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  const supabase = await createClient();
  const { data: open } = await supabase
    .from("rest_log")
    .select("id")
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!open) return { ok: false, error: "No open rest block." };
  return endSleep({
    rest_id: open.id as string,
    whoop_recovery: recovery_pct,
  });
}

/**
 * Manually record Whoop recovery % (separate from rest end).
 * Creates a zero-duration rest_log row so the engine has recent data.
 */
export async function logRecovery(input: RecoveryInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  const supabase = await createClient();
  const now = new Date().toISOString();
  const recovery = Math.max(0, Math.min(100, input.recovery_pct));
  const { data, error } = await supabase
    .from("rest_log")
    .insert({
      started_at: now,
      ended_at: now,
      whoop_recovery: recovery,
      notes: input.notes ? `recovery-only · ${input.notes}` : "recovery-only",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sleep");
  revalidatePath("/compliance");
  return { ok: true, id: data.id as string };
}
