/**
 * Type-safe loader for /public/bikes/catalog.json. The file is the source of
 * truth for Team Kabir's bike fleet (manually curated). Types live here so any
 * UI consuming the catalog gets autocomplete + type checks.
 */

import { promises as fs } from "node:fs";
import { join } from "node:path";

export interface CatalogBike {
  id: string;
  model_full: string;
  type: string;
  frame_material: string;
  groupset: string;
  color: string;
  /** Path under /public — already a public URL (e.g. "/manuals/...") */
  manual_pdf: string;
  use_case: string;
  notes: string;
  /** Optional photo path, also under /public. */
  photo?: string;
}

export interface CatalogAppPairing {
  name: string;
  platform: string;
  purpose: string;
  applies_to_bikes: string[];
}

export interface CatalogSharedManual {
  name: string;
  code: string;
  pdf: string;
  covers: string;
  applies_to_bikes: string[];
}

export interface BikeCatalog {
  team_id_owner: string;
  rider: string;
  groupset_default: string;
  updated_at: string;
  bikes: CatalogBike[];
  groupset_app_pairings: CatalogAppPairing[];
  shared_manuals: CatalogSharedManual[];
}

let cache: BikeCatalog | null = null;

export async function getBikeCatalog(): Promise<BikeCatalog> {
  if (cache) return cache;
  const path = join(process.cwd(), "public", "bikes", "catalog.json");
  const raw = await fs.readFile(path, "utf8");
  const parsed = JSON.parse(raw) as BikeCatalog;
  cache = parsed;
  return parsed;
}
