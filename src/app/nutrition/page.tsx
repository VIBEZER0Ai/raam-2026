import { NutritionLog } from "@/components/screens/nutrition-log";
import { getRecentNutrition, getNutritionRollup } from "@/lib/db/queries";

export const revalidate = 15;

export default async function NutritionPage() {
  const [entries, rollup] = await Promise.all([
    getRecentNutrition(30),
    getNutritionRollup(),
  ]);
  return <NutritionLog entries={entries} rollup={rollup} />;
}
