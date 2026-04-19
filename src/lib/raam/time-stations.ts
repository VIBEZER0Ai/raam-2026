/**
 * RAAM 54 Time Stations + Kabir Rachure's 2023 splits (baseline for 2026 pacing).
 * Source: Official RAAM 2023 timing report for Kabir Rachure (Racer #610, Solo Men, Official finish).
 * 2026 route is essentially same as 2025/2023 per GEAR Book.
 */

export interface TimeStation {
  ts_num: number;
  name: string;
  state: string;
  mile_total: number;
  miles_to_fin: number;
  split_2023_elapsed: string; // "Xd Yh Zm" from start
  avg_speed_2023: number; // cumulative avg mph at this TS
  avg_this_ts_2023: number; // segment avg mph from prior TS
}

export const TIME_STATIONS: TimeStation[] = [
  { ts_num: 0,  name: "Oceanside",        state: "CA", mile_total: 0.00,    miles_to_fin: 3037.79, split_2023_elapsed: "0d 0h 0m",    avg_speed_2023: 0.00,  avg_this_ts_2023: 0.00 },
  { ts_num: 1,  name: "Borrego Springs",  state: "CA", mile_total: 88.32,   miles_to_fin: 2949.47, split_2023_elapsed: "0d 5h 1m",    avg_speed_2023: 17.61, avg_this_ts_2023: 17.61 },
  { ts_num: 2,  name: "Brawley",          state: "CA", mile_total: 145.30,  miles_to_fin: 2892.49, split_2023_elapsed: "0d 7h 48m",   avg_speed_2023: 18.63, avg_this_ts_2023: 20.47 },
  { ts_num: 3,  name: "Blythe",           state: "CA", mile_total: 234.97,  miles_to_fin: 2802.82, split_2023_elapsed: "0d 12h 49m",  avg_speed_2023: 18.33, avg_this_ts_2023: 17.87 },
  { ts_num: 4,  name: "Parker",           state: "AZ", mile_total: 286.33,  miles_to_fin: 2751.46, split_2023_elapsed: "0d 15h 49m",  avg_speed_2023: 18.10, avg_this_ts_2023: 17.12 },
  { ts_num: 5,  name: "Salome",           state: "AZ", mile_total: 342.37,  miles_to_fin: 2695.42, split_2023_elapsed: "0d 19h 50m",  avg_speed_2023: 17.26, avg_this_ts_2023: 13.95 },
  { ts_num: 6,  name: "Congress",         state: "AZ", mile_total: 395.00,  miles_to_fin: 2642.79, split_2023_elapsed: "0d 23h 24m",  avg_speed_2023: 16.88, avg_this_ts_2023: 14.76 },
  { ts_num: 7,  name: "Prescott",         state: "AZ", mile_total: 445.47,  miles_to_fin: 2592.32, split_2023_elapsed: "1d 6h 24m",   avg_speed_2023: 14.65, avg_this_ts_2023: 7.21 },
  { ts_num: 8,  name: "Campo Verde",      state: "AZ", mile_total: 500.10,  miles_to_fin: 2537.69, split_2023_elapsed: "1d 10h 26m",  avg_speed_2023: 14.52, avg_this_ts_2023: 13.54 },
  { ts_num: 9,  name: "Flagstaff",        state: "AZ", mile_total: 500.10,  miles_to_fin: 2434.91, split_2023_elapsed: "1d 11h 46m",  avg_speed_2023: 13.98, avg_this_ts_2023: 0.00 },
  { ts_num: 10, name: "Tuba City",        state: "AZ", mile_total: 575.11,  miles_to_fin: 2359.90, split_2023_elapsed: "1d 16h 32m",  avg_speed_2023: 14.19, avg_this_ts_2023: 15.74 },
  { ts_num: 11, name: "Kayenta",          state: "AZ", mile_total: 646.94,  miles_to_fin: 2288.07, split_2023_elapsed: "1d 20h 57m",  avg_speed_2023: 14.39, avg_this_ts_2023: 16.26 },
  { ts_num: 12, name: "Mexican Hat",      state: "UT", mile_total: 691.64,  miles_to_fin: 2243.37, split_2023_elapsed: "1d 23h 27m",  avg_speed_2023: 14.58, avg_this_ts_2023: 17.88 },
  { ts_num: 13, name: "Montezuma Creek",  state: "UT", mile_total: 731.25,  miles_to_fin: 2203.76, split_2023_elapsed: "2d 4h 47m",   avg_speed_2023: 13.85, avg_this_ts_2023: 7.43 },
  { ts_num: 14, name: "Cortez",           state: "CO", mile_total: 781.45,  miles_to_fin: 2153.56, split_2023_elapsed: "2d 8h 32m",   avg_speed_2023: 13.82, avg_this_ts_2023: 13.39 },
  { ts_num: 15, name: "Durango",          state: "CO", mile_total: 825.65,  miles_to_fin: 2109.36, split_2023_elapsed: "2d 12h 3m",   avg_speed_2023: 13.75, avg_this_ts_2023: 12.57 },
  { ts_num: 16, name: "Pagosa Springs",   state: "CO", mile_total: 879.95,  miles_to_fin: 2055.04, split_2023_elapsed: "2d 16h 57m",  avg_speed_2023: 13.55, avg_this_ts_2023: 11.08 },
  { ts_num: 17, name: "South Fork",       state: "CO", mile_total: 927.85,  miles_to_fin: 2007.14, split_2023_elapsed: "2d 21h 24m",  avg_speed_2023: 13.37, avg_this_ts_2023: 10.76 },
  { ts_num: 18, name: "Alamosa",          state: "CO", mile_total: 974.44,  miles_to_fin: 1960.55, split_2023_elapsed: "3d 3h 42m",   avg_speed_2023: 12.87, avg_this_ts_2023: 7.40 },
  { ts_num: 19, name: "La Veta",          state: "CO", mile_total: 1032.74, miles_to_fin: 1902.25, split_2023_elapsed: "3d 7h 19m",   avg_speed_2023: 13.02, avg_this_ts_2023: 16.12 },
  { ts_num: 20, name: "Trinidad",         state: "CO", mile_total: 1098.14, miles_to_fin: 1836.85, split_2023_elapsed: "3d 14h 2m",   avg_speed_2023: 12.76, avg_this_ts_2023: 9.74 },
  { ts_num: 21, name: "Kim",              state: "CO", mile_total: 1169.44, miles_to_fin: 1765.55, split_2023_elapsed: "3d 19h 31m",  avg_speed_2023: 12.78, avg_this_ts_2023: 13.00 },
  { ts_num: 22, name: "Walsh",            state: "CO", mile_total: 1237.81, miles_to_fin: 1697.18, split_2023_elapsed: "4d 0h 29m",   avg_speed_2023: 12.83, avg_this_ts_2023: 13.77 },
  { ts_num: 23, name: "Ulysses",          state: "KS", mile_total: 1292.17, miles_to_fin: 1642.82, split_2023_elapsed: "4d 7h 48m",   avg_speed_2023: 12.45, avg_this_ts_2023: 7.43 },
  { ts_num: 24, name: "Montezuma",        state: "KS", mile_total: 1342.17, miles_to_fin: 1593.00, split_2023_elapsed: "4d 10h 47m",  avg_speed_2023: 12.57, avg_this_ts_2023: 16.76 },
  { ts_num: 25, name: "Greensburg",       state: "KS", mile_total: 1408.30, miles_to_fin: 1526.72, split_2023_elapsed: "4d 15h 9m",   avg_speed_2023: 12.67, avg_this_ts_2023: 15.14 },
  { ts_num: 26, name: "Pratt",            state: "KS", mile_total: 1440.41, miles_to_fin: 1494.61, split_2023_elapsed: "4d 17h 20m",  avg_speed_2023: 12.71, avg_this_ts_2023: 14.71 },
  { ts_num: 27, name: "Maize",            state: "KS", mile_total: 1517.36, miles_to_fin: 1417.66, split_2023_elapsed: "4d 22h 37m",  avg_speed_2023: 12.79, avg_this_ts_2023: 14.56 },
  { ts_num: 28, name: "El Dorado",        state: "KS", mile_total: 1551.34, miles_to_fin: 1383.68, split_2023_elapsed: "5d 1h 10m",   avg_speed_2023: 12.80, avg_this_ts_2023: 13.33 },
  { ts_num: 29, name: "Yates Center",     state: "KS", mile_total: 1615.97, miles_to_fin: 1319.05, split_2023_elapsed: "5d 8h 29m",   avg_speed_2023: 12.58, avg_this_ts_2023: 8.83 },
  { ts_num: 30, name: "Ft Scott",         state: "KS", mile_total: 1675.98, miles_to_fin: 1259.04, split_2023_elapsed: "5d 13h 7m",   avg_speed_2023: 12.59, avg_this_ts_2023: 12.95 },
  { ts_num: 31, name: "Weaubleau",        state: "MO", mile_total: 1741.43, miles_to_fin: 1193.59, split_2023_elapsed: "5d 18h 27m",  avg_speed_2023: 12.58, avg_this_ts_2023: 12.27 },
  { ts_num: 32, name: "Camdenton",        state: "MO", mile_total: 1790.54, miles_to_fin: 1144.48, split_2023_elapsed: "6d 1h 42m",   avg_speed_2023: 12.29, avg_this_ts_2023: 6.77 },
  { ts_num: 33, name: "Jefferson City",   state: "MO", mile_total: 1847.29, miles_to_fin: 1087.73, split_2023_elapsed: "6d 5h 46m",   avg_speed_2023: 12.33, avg_this_ts_2023: 13.95 },
  { ts_num: 34, name: "Washington",       state: "MO", mile_total: 1924.46, miles_to_fin: 1010.56, split_2023_elapsed: "6d 11h 34m",  avg_speed_2023: 12.37, avg_this_ts_2023: 13.31 },
  { ts_num: 35, name: "Mississippi",      state: "IL", mile_total: 1996.59, miles_to_fin: 938.43,  split_2023_elapsed: "6d 18h 1m",   avg_speed_2023: 12.32, avg_this_ts_2023: 11.18 },
  { ts_num: 36, name: "Greenville",       state: "IL", mile_total: 2042.65, miles_to_fin: 892.37,  split_2023_elapsed: "7d 1h 3m",    avg_speed_2023: 12.08, avg_this_ts_2023: 6.55 },
  { ts_num: 37, name: "Effingham",        state: "IL", mile_total: 2091.58, miles_to_fin: 843.44,  split_2023_elapsed: "7d 4h 48m",   avg_speed_2023: 12.10, avg_this_ts_2023: 13.05 },
  { ts_num: 38, name: "Sullivan",         state: "IN", mile_total: 2164.70, miles_to_fin: 770.32,  split_2023_elapsed: "7d 10h 47m",  avg_speed_2023: 12.11, avg_this_ts_2023: 12.22 },
  { ts_num: 39, name: "Bloomington",      state: "IN", mile_total: 2232.20, miles_to_fin: 702.82,  split_2023_elapsed: "7d 16h 33m",  avg_speed_2023: 12.10, avg_this_ts_2023: 11.71 },
  { ts_num: 40, name: "Greensburg",       state: "IN", mile_total: 2294.14, miles_to_fin: 640.88,  split_2023_elapsed: "7d 21h 57m",  avg_speed_2023: 12.08, avg_this_ts_2023: 11.47 },
  { ts_num: 41, name: "Oxford",           state: "OH", mile_total: 2343.99, miles_to_fin: 591.03,  split_2023_elapsed: "8d 5h 28m",   avg_speed_2023: 11.87, avg_this_ts_2023: 6.63 },
  { ts_num: 42, name: "Blanchester",      state: "OH", mile_total: 2396.62, miles_to_fin: 538.40,  split_2023_elapsed: "8d 10h 7m",   avg_speed_2023: 11.86, avg_this_ts_2023: 11.32 },
  { ts_num: 43, name: "Chillicothe",      state: "OH", mile_total: 2448.52, miles_to_fin: 486.50,  split_2023_elapsed: "8d 14h 52m",  avg_speed_2023: 11.84, avg_this_ts_2023: 10.93 },
  { ts_num: 44, name: "Athens",           state: "OH", mile_total: 2513.83, miles_to_fin: 421.19,  split_2023_elapsed: "8d 20h 48m",  avg_speed_2023: 11.81, avg_this_ts_2023: 11.01 },
  { ts_num: 45, name: "West Union",       state: "WV", mile_total: 2599.41, miles_to_fin: 335.61,  split_2023_elapsed: "9d 8h 41m",   avg_speed_2023: 11.57, avg_this_ts_2023: 7.20 },
  { ts_num: 46, name: "Grafton",          state: "WV", mile_total: 2645.79, miles_to_fin: 289.23,  split_2023_elapsed: "9d 15h 5m",   avg_speed_2023: 11.45, avg_this_ts_2023: 7.25 },
  { ts_num: 47, name: "McHenry",          state: "MD", mile_total: 2701.70, miles_to_fin: 233.32,  split_2023_elapsed: "9d 20h 32m",  avg_speed_2023: 11.42, avg_this_ts_2023: 10.26 },
  { ts_num: 48, name: "Cumberland",       state: "MD", mile_total: 2750.66, miles_to_fin: 184.36,  split_2023_elapsed: "10d 1h 41m",  avg_speed_2023: 11.38, avg_this_ts_2023: 9.51 },
  { ts_num: 49, name: "Hancock",          state: "MD", mile_total: 2787.80, miles_to_fin: 147.22,  split_2023_elapsed: "10d 4h 59m",  avg_speed_2023: 11.38, avg_this_ts_2023: 11.25 },
  { ts_num: 50, name: "Rouzerville",      state: "PA", mile_total: 2836.27, miles_to_fin: 98.75,   split_2023_elapsed: "10d 9h 38m",  avg_speed_2023: 11.36, avg_this_ts_2023: 10.42 },
  { ts_num: 51, name: "Mt Airy",          state: "MD", mile_total: 2880.37, miles_to_fin: 54.65,   split_2023_elapsed: "10d 15h 3m",  avg_speed_2023: 11.29, avg_this_ts_2023: 8.14 },
  { ts_num: 52, name: "Odenton",          state: "MD", mile_total: 2919.85, miles_to_fin: 15.17,   split_2023_elapsed: "10d 18h 13m", avg_speed_2023: 11.31, avg_this_ts_2023: 12.47 },
  { ts_num: 53, name: "Annapolis",        state: "MD", mile_total: 2929.22, miles_to_fin: 5.80,    split_2023_elapsed: "10d 18h 55m", avg_speed_2023: 11.31, avg_this_ts_2023: 13.39 },
  { ts_num: 54, name: "Finish",           state: "NJ", mile_total: 2935.02, miles_to_fin: 0.00,    split_2023_elapsed: "10d 18h 1m",  avg_speed_2023: 11.38, avg_this_ts_2023: 0.00 },
];

/** Danger zones — segments where Kabir slowed significantly in 2023 (<8mph). */
export const DANGER_ZONES_2023 = TIME_STATIONS
  .filter(ts => ts.avg_this_ts_2023 > 0 && ts.avg_this_ts_2023 < 8)
  .map(ts => ({ ts_num: ts.ts_num, name: ts.name, speed: ts.avg_this_ts_2023 }));
