"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDefaultTeam } from "@/lib/team";

export type StopReason =
  | "loo"
  | "food"
  | "mech"
  | "medical"
  | "sleep"
  | "media"
  | "other";

const COUNTDOWN_MIN = 15;
const FAST_PATH: StopReason[] = ["mech", "medical"]; // skip the 15-min wait

interface CreateStopInput {
  reason: StopReason;
  notes?: string;
}

export interface StopActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/**
 * Crew creates a stop request. Default = 15-min heads-up to the rider so they
 * can plan effort + bottle hand-offs around it. Mech / medical bypass the wait.
 */
export async function createStopRequest(
  input: CreateStopInput,
): Promise<StopActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "not signed in" };
  const team = await getDefaultTeam();
  if (!team) return { ok: false, error: "no team" };

  const isEmergency = FAST_PATH.includes(input.reason);
  const dispatchAt = new Date(
    Date.now() + (isEmergency ? 0 : COUNTDOWN_MIN * 60_000),
  ).toISOString();

  const supabase = await createClient();

  // Resolve crew_member row + label for denormalized requested_by_label.
  const { data: crew } = await supabase
    .from("crew_member")
    .select("id, full_name, initials")
    .or(`auth_user_id.eq.${user.id},email.ilike.${user.email}`)
    .maybeSingle();
  const label =
    (crew as { full_name?: string | null } | null)?.full_name ??
    user.email ??
    "crew";

  const { data, error } = await supabase
    .from("stop_request")
    .insert({
      team_id: team.id,
      requested_by_crew_id: (crew as { id?: string } | null)?.id ?? null,
      requested_by_label: label,
      reason: input.reason,
      is_emergency: isEmergency,
      dispatch_at: dispatchAt,
      notes: input.notes ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[createStopRequest]", error);
    return { ok: false, error: error.message };
  }
  revalidatePath("/", "layout");
  return { ok: true, id: (data as { id: string }).id };
}

/**
 * Rider acknowledges a pending request — UI surface TBD per AA6.14.
 * For now, any team member with role 'rider' or 'chief' can ack.
 */
export async function ackStopRequest(id: string): Promise<StopActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "not signed in" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("stop_request")
    .update({
      status: "acknowledged",
      rider_acknowledged_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Mark stop dispatched — clock starts ticking, rider has stopped. */
export async function dispatchStopRequest(id: string): Promise<StopActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("stop_request")
    .update({
      status: "dispatched",
      dispatched_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Cancel a pending request (e.g. crew member changed mind, found alt). */
export async function cancelStopRequest(
  id: string,
  reason?: string,
): Promise<StopActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("stop_request")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason ?? null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
