import { redirect } from "next/navigation";
import { SignupWizard } from "./signup-wizard";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Create a team · Ventor" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/signup");

  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("event_template")
    .select("code, name, sport, discipline, total_miles, total_km")
    .order("sport", { ascending: true });

  return (
    <SignupWizard
      templates={(templates ?? []) as {
        code: string;
        name: string;
        sport: string;
        discipline: string | null;
        total_miles: number | null;
        total_km: number | null;
      }[]}
    />
  );
}
