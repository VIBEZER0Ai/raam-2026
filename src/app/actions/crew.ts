"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export type CrewRole =
  | "crew_chief"
  | "cc_operator"
  | "follow_driver"
  | "shuttle_driver"
  | "rv_crew"
  | "media"
  | "rider"
  | "observer";

export interface CrewPatch {
  id: string;
  full_name?: string;
  role?: CrewRole;
  title?: string | null;
  initials?: string | null;
  color?: string | null;
  phone?: string | null;
  email?: string | null;
  emergency_contact?: string | null;
  active?: boolean;
}

export interface NewCrew {
  full_name: string;
  role: CrewRole;
  title?: string;
  initials?: string;
  color?: string;
  phone?: string;
  email?: string;
  emergency_contact?: string;
}

type Result =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Update one or more fields on a crew_member row. */
export async function updateCrewMember(patch: CrewPatch): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const supabase = await createClient();
  const {
    id,
    full_name,
    role,
    title,
    initials,
    color,
    phone,
    email,
    emergency_contact,
    active,
  } = patch;

  const updates: Record<string, unknown> = {};
  if (full_name !== undefined) updates.full_name = full_name.trim();
  if (role !== undefined) updates.role = role;
  if (title !== undefined) updates.title = title?.trim() || null;
  if (initials !== undefined)
    updates.initials = initials?.trim().slice(0, 3).toUpperCase() || null;
  if (color !== undefined) updates.color = color?.trim() || null;
  if (phone !== undefined) updates.phone = phone?.trim() || null;
  if (email !== undefined)
    updates.email = email?.trim().toLowerCase() || null;
  if (emergency_contact !== undefined)
    updates.emergency_contact = emergency_contact?.trim() || null;
  if (active !== undefined) updates.active = active;

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: "No fields to update." };
  }

  const { error } = await supabase
    .from("crew_member")
    .update(updates)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/crew");
  revalidatePath("/admin");
  return { ok: true, id };
}

export async function createCrewMember(input: NewCrew): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in required." };
  if (!input.full_name.trim()) return { ok: false, error: "Name required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crew_member")
    .insert({
      full_name: input.full_name.trim(),
      role: input.role,
      title: input.title?.trim() || null,
      initials:
        input.initials?.trim().slice(0, 3).toUpperCase() ||
        input.full_name
          .split(/\s+/)
          .slice(0, 2)
          .map((s) => s[0]?.toUpperCase() ?? "")
          .join(""),
      color: input.color?.trim() || "#34d399",
      phone: input.phone?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      emergency_contact: input.emergency_contact?.trim() || null,
      active: true,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crew");
  revalidatePath("/admin");
  return { ok: true, id: data.id as string };
}

export async function deactivateCrewMember(id: string): Promise<Result> {
  return updateCrewMember({ id, active: false });
}
