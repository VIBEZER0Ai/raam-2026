"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface LogNutritionInput {
  carbs_g?: number;
  water_ml?: number;
  sodium_mg?: number;
  caffeine_mg?: number;
  calories_kcal?: number;
  notes?: string;
}

export async function logNutrition(
  input: LogNutritionInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  // Reject empty log — at least one field must be > 0 or a note present.
  const hasMacro =
    (input.carbs_g ?? 0) > 0 ||
    (input.water_ml ?? 0) > 0 ||
    (input.sodium_mg ?? 0) > 0 ||
    (input.caffeine_mg ?? 0) > 0 ||
    (input.calories_kcal ?? 0) > 0;
  if (!hasMacro && !input.notes?.trim()) {
    return { ok: false, error: "Nothing to log." };
  }

  const supabase = await createClient();

  // Link to crew_member via email match (best effort)
  let loggedBy: string | null = null;
  if (user.email) {
    const { data } = await supabase
      .from("crew_member")
      .select("id")
      .ilike("email", user.email)
      .maybeSingle();
    if (data) loggedBy = data.id as string;
  }

  const { data, error } = await supabase
    .from("nutrition_log")
    .insert({
      logged_at: new Date().toISOString(),
      carbs_g: input.carbs_g ?? 0,
      water_ml: input.water_ml ?? 0,
      sodium_mg: input.sodium_mg ?? 0,
      caffeine_mg: input.caffeine_mg ?? 0,
      calories_kcal: input.calories_kcal ?? 0,
      notes: input.notes?.trim() || null,
      logged_by: loggedBy,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/nutrition");
  revalidatePath("/");
  return { ok: true, id: data.id as string };
}

export async function deleteNutritionEntry(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase.from("nutrition_log").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/nutrition");
  return { ok: true };
}
