/**
 * /bikes — Team Kabir's bike + tool catalog (AA6.4).
 *
 * Reads /public/bikes/catalog.json and renders one card per bike with the
 * groupset, use-case, photo (if dropped into /public/bikes/) and a link to
 * the official Scott manual PDF for that model. Shared manuals (Shimano Di2)
 * appear in their own section.
 */

import { getBikeCatalog } from "@/lib/raam/bike-catalog";
import { Bikes } from "@/components/screens/bikes";

export const revalidate = 3600;

export default async function BikesPage() {
  const catalog = await getBikeCatalog();
  return <Bikes catalog={catalog} />;
}
