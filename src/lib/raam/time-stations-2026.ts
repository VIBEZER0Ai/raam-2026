/**
 * RAAM 2026 — Official 54 time stations.
 *
 * Source of truth: 2026_RAAM_Route_Book_FINAL.pdf, "You have completed N miles"
 * header on each TS section page, plus the racing-ends marker on TS53.
 *
 * Differences vs 2023 (src/lib/raam/time-stations.ts):
 * - Eastern half rerouted: 2023 ended at Annapolis MD via Mt Airy + Odenton.
 *   2026 ends at Atlantic City NJ via Darlington MD → Malaga NJ.
 * - Total race distance bumped from 2935 → 3068.2 miles.
 * - TS47 onward names and miles all shift.
 */

export interface TimeStation2026 {
  ts_num: number;
  name: string;
  state: string;
  mile_total: number;
  miles_to_fin: number;
  /**
   * Section-level rule flags pulled from the route-book section header.
   * These are the constraints that apply within the *prior* segment
   * (ts_num-1 → ts_num). Empty array = standard rules (leapfrog daytime,
   * direct-follow nighttime, five-foot rule).
   */
  flags?: SectionFlag[];
}

export type SectionFlag =
  | "racers-only"            // unsupported zone, no support vehicles at all
  | "no-aux-vehicles"         // primary follow only, aux/RV must take alternate
  | "no-rvs"                  // RVs must take alternate
  | "leapfrog-daytime"        // explicit leapfrog-only mention
  | "direct-follow-mandatory" // mandatory direct follow day+night
  | "shuttle-zone"            // racer must be shuttled in follow vehicle
  | "tz-change"               // time-zone boundary inside this segment
  | "altitude-pass"           // major mountain pass within segment
  | "no-services";            // long stretch without gas/grocery

export const RACE_TOTAL_MI_2026 = 3068.2;

export const TIME_STATIONS_2026: TimeStation2026[] = [
  { ts_num: 0,  name: "Oceanside",        state: "CA", mile_total: 0,      miles_to_fin: 3068.2, flags: ["racers-only"] },
  { ts_num: 1,  name: "Borrego Springs",  state: "CA", mile_total: 88.4,   miles_to_fin: 2979.8, flags: ["leapfrog-daytime"] },
  { ts_num: 2,  name: "Brawley",          state: "CA", mile_total: 145.5,  miles_to_fin: 2922.7, flags: ["leapfrog-daytime"] },
  { ts_num: 3,  name: "Blythe",           state: "CA", mile_total: 235.2,  miles_to_fin: 2833.0 },
  { ts_num: 4,  name: "Parker",           state: "AZ", mile_total: 286.5,  miles_to_fin: 2781.7, flags: ["no-aux-vehicles"] },
  { ts_num: 5,  name: "Salome",           state: "AZ", mile_total: 342.5,  miles_to_fin: 2725.7, flags: ["no-aux-vehicles"] },
  { ts_num: 6,  name: "Congress",         state: "AZ", mile_total: 395.7,  miles_to_fin: 2672.5, flags: ["no-aux-vehicles"] },
  { ts_num: 7,  name: "Prescott",         state: "AZ", mile_total: 445.7,  miles_to_fin: 2622.5, flags: ["no-aux-vehicles", "no-rvs"] },
  { ts_num: 8,  name: "Cottonwood",       state: "AZ", mile_total: 485.6,  miles_to_fin: 2582.6, flags: ["no-aux-vehicles", "no-rvs", "leapfrog-daytime"] },
  { ts_num: 9,  name: "Flagstaff",        state: "AZ", mile_total: 537.3,  miles_to_fin: 2530.9, flags: ["shuttle-zone", "no-aux-vehicles", "no-rvs"] },
  { ts_num: 10, name: "Tuba City",        state: "AZ", mile_total: 612.2,  miles_to_fin: 2456.0, flags: ["direct-follow-mandatory", "tz-change", "no-services"] },
  { ts_num: 11, name: "Kayenta",          state: "AZ", mile_total: 684.0,  miles_to_fin: 2384.2, flags: ["direct-follow-mandatory"] },
  { ts_num: 12, name: "Mexican Hat",      state: "UT", mile_total: 728.7,  miles_to_fin: 2339.5, flags: ["direct-follow-mandatory"] },
  { ts_num: 13, name: "Montezuma Creek",  state: "UT", mile_total: 768.3,  miles_to_fin: 2299.9, flags: ["direct-follow-mandatory"] },
  { ts_num: 14, name: "Cortez",           state: "CO", mile_total: 818.6,  miles_to_fin: 2249.6 },
  { ts_num: 15, name: "Durango",          state: "CO", mile_total: 862.8,  miles_to_fin: 2205.4 },
  { ts_num: 16, name: "Pagosa Springs",   state: "CO", mile_total: 917.1,  miles_to_fin: 2151.1 },
  { ts_num: 17, name: "South Fork",       state: "CO", mile_total: 963.8,  miles_to_fin: 2104.4, flags: ["altitude-pass"] }, // Wolf Creek Pass 10,856ft
  { ts_num: 18, name: "Alamosa",          state: "CO", mile_total: 1011.4, miles_to_fin: 2056.8 },
  { ts_num: 19, name: "La Veta",          state: "CO", mile_total: 1070.1, miles_to_fin: 1998.1, flags: ["altitude-pass"] }, // La Veta Pass
  { ts_num: 20, name: "Trinidad",         state: "CO", mile_total: 1135.6, miles_to_fin: 1932.6, flags: ["altitude-pass"] }, // Cuchara Pass 9995ft
  { ts_num: 21, name: "Kim",              state: "CO", mile_total: 1206.9, miles_to_fin: 1861.3, flags: ["no-services"] },
  { ts_num: 22, name: "Walsh",            state: "CO", mile_total: 1275.4, miles_to_fin: 1792.8 },
  { ts_num: 23, name: "Ulysses",          state: "KS", mile_total: 1329.8, miles_to_fin: 1738.4, flags: ["tz-change"] }, // CDT enter
  { ts_num: 24, name: "Montezuma",        state: "KS", mile_total: 1379.9, miles_to_fin: 1688.3 },
  { ts_num: 25, name: "Greensburg",       state: "KS", mile_total: 1446.0, miles_to_fin: 1622.2 },
  { ts_num: 26, name: "Pratt",            state: "KS", mile_total: 1478.1, miles_to_fin: 1590.1 },
  { ts_num: 27, name: "Maize",            state: "KS", mile_total: 1555.2, miles_to_fin: 1513.0 },
  { ts_num: 28, name: "El Dorado",        state: "KS", mile_total: 1589.2, miles_to_fin: 1479.0 },
  { ts_num: 29, name: "Yates Center",     state: "KS", mile_total: 1654.0, miles_to_fin: 1414.2 },
  { ts_num: 30, name: "Fort Scott",       state: "KS", mile_total: 1714.1, miles_to_fin: 1354.1 },
  { ts_num: 31, name: "Weaubleau",        state: "MO", mile_total: 1779.6, miles_to_fin: 1288.6 },
  { ts_num: 32, name: "Camdenton",        state: "MO", mile_total: 1828.8, miles_to_fin: 1239.4 },
  { ts_num: 33, name: "Jefferson City",   state: "MO", mile_total: 1885.5, miles_to_fin: 1182.7 },
  { ts_num: 34, name: "Washington",       state: "MO", mile_total: 1962.7, miles_to_fin: 1105.5 },
  { ts_num: 35, name: "West Alton",       state: "MO", mile_total: 2035.0, miles_to_fin: 1033.2 },
  { ts_num: 36, name: "Greenville",       state: "IL", mile_total: 2081.1, miles_to_fin: 987.1 },
  { ts_num: 37, name: "Effingham",        state: "IL", mile_total: 2130.1, miles_to_fin: 938.1 },
  { ts_num: 38, name: "Sullivan",         state: "IN", mile_total: 2203.4, miles_to_fin: 864.8, flags: ["tz-change"] }, // EDT enter (RAAM time)
  { ts_num: 39, name: "Bloomington",      state: "IN", mile_total: 2272.1, miles_to_fin: 796.1 },
  { ts_num: 40, name: "Greensburg",       state: "IN", mile_total: 2333.0, miles_to_fin: 735.2 },
  { ts_num: 41, name: "Oxford",           state: "OH", mile_total: 2382.9, miles_to_fin: 685.3 },
  { ts_num: 42, name: "Blanchester",      state: "OH", mile_total: 2437.2, miles_to_fin: 631.0 },
  { ts_num: 43, name: "Chillicothe",      state: "OH", mile_total: 2487.8, miles_to_fin: 580.4 },
  { ts_num: 44, name: "Athens",           state: "OH", mile_total: 2553.3, miles_to_fin: 514.9 },
  { ts_num: 45, name: "West Union",       state: "WV", mile_total: 2638.9, miles_to_fin: 429.3 },
  { ts_num: 46, name: "Grafton",          state: "WV", mile_total: 2685.4, miles_to_fin: 382.8 },
  { ts_num: 47, name: "McHenry",          state: "MD", mile_total: 2741.3, miles_to_fin: 326.9 },
  { ts_num: 48, name: "Cumberland",       state: "MD", mile_total: 2790.3, miles_to_fin: 277.9 },
  { ts_num: 49, name: "Hancock",          state: "MD", mile_total: 2827.5, miles_to_fin: 240.7 },
  { ts_num: 50, name: "Rouzerville",      state: "PA", mile_total: 2876.0, miles_to_fin: 192.2 },
  { ts_num: 51, name: "Darlington",       state: "MD", mile_total: 2959.2, miles_to_fin: 109.0 },
  { ts_num: 52, name: "Malaga",           state: "NJ", mile_total: 3029.7, miles_to_fin: 38.5,  flags: ["shuttle-zone"] }, // Delaware Memorial Bridge
  { ts_num: 53, name: "Atlantic City",    state: "NJ", mile_total: 3066.4, miles_to_fin: 1.7 },  // racing ends
  { ts_num: 54, name: "Finish (Boardwalk)", state: "NJ", mile_total: 3068.1, miles_to_fin: 0 },
];

/** Aux-vehicle fallback zones — sections where follow vehicle is alone. */
export const AUX_FALLBACK_ZONES_2026 = TIME_STATIONS_2026
  .filter((ts) => ts.flags?.includes("no-aux-vehicles"))
  .map((ts) => ({ ts_num: ts.ts_num, name: ts.name, state: ts.state }));

/** Mandatory direct-follow zones — both vehicles glued together. */
export const DIRECT_FOLLOW_ZONES_2026 = TIME_STATIONS_2026
  .filter((ts) => ts.flags?.includes("direct-follow-mandatory"))
  .map((ts) => ({ ts_num: ts.ts_num, name: ts.name, state: ts.state }));

/** Shuttle zones — Sedona (TS9) + Delaware Memorial Bridge (TS52). */
export const SHUTTLE_ZONES_2026 = TIME_STATIONS_2026
  .filter((ts) => ts.flags?.includes("shuttle-zone"))
  .map((ts) => ({ ts_num: ts.ts_num, name: ts.name, state: ts.state }));
