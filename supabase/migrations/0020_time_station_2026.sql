-- 0020_time_station_2026.sql
-- Reseed time_station with official 2026 RAAM route (54 TS + finish).
-- Source: 2026_RAAM_Route_Book_FINAL.pdf + RidewithGPS route 54768164.
-- Eastern half rerouted vs 2023: now ends Atlantic City NJ via Darlington MD + Malaga NJ.
-- Total race distance: 3068.2 mi.

-- Add section-flag column (rule constraints active in the segment ENTERING this TS).
alter table time_station
  add column if not exists flags jsonb not null default '[]'::jsonb;

-- Reseed via UPSERT — TS rows are referenced by target_plan, sleep_plan, rule_evaluation, gps_matched.
-- All 2023 split / pacing columns are nulled so AA-cron rebuilds them for 2026.
update time_station
   set arrival_ts_edt = null,
       split_2023_elapsed = null,
       avg_speed_2023 = null,
       avg_this_ts_2023 = null;

insert into time_station (ts_num, name, state, mile_total, miles_to_fin, lat, lng, flags) values
  (0, 'Oceanside', 'CA', 0, 3068.2, 33.194456, -117.384258, '["racers-only"]'::jsonb),
  (1, 'Borrego Springs', 'CA', 88.4, 2979.8, 33.255605, -116.374975, '["leapfrog-daytime"]'::jsonb),
  (2, 'Brawley', 'CA', 145.5, 2922.7, 32.978541, -115.541444, '["leapfrog-daytime"]'::jsonb),
  (3, 'Blythe', 'CA', 235.2, 2833, 33.610558, -114.581775, '[]'::jsonb),
  (4, 'Parker', 'AZ', 286.5, 2781.7, 34.139565, -114.282568, '["no-aux-vehicles"]'::jsonb),
  (5, 'Salome', 'AZ', 342.5, 2725.7, 33.791376, -113.597259, '["no-aux-vehicles"]'::jsonb),
  (6, 'Congress', 'AZ', 395.7, 2672.5, 34.166397, -112.837243, '["no-aux-vehicles"]'::jsonb),
  (7, 'Prescott', 'AZ', 445.7, 2622.5, 34.570782, -112.482232, '["no-aux-vehicles","no-rvs"]'::jsonb),
  (8, 'Cottonwood', 'AZ', 485.6, 2582.6, 34.739456, -112.023110, '["no-aux-vehicles","no-rvs","leapfrog-daytime"]'::jsonb),
  (9, 'Flagstaff', 'AZ', 537.3, 2530.9, 35.208142, -111.609644, '["shuttle-zone","no-aux-vehicles","no-rvs"]'::jsonb),
  (10, 'Tuba City', 'AZ', 612.2, 2456, 36.122526, -111.214406, '["direct-follow-mandatory","tz-change","no-services"]'::jsonb),
  (11, 'Kayenta', 'AZ', 684, 2384.2, 36.719103, -110.254353, '["direct-follow-mandatory"]'::jsonb),
  (12, 'Mexican Hat', 'UT', 728.7, 2339.5, 37.162440, -109.859073, '["direct-follow-mandatory"]'::jsonb),
  (13, 'Montezuma Creek', 'UT', 768.3, 2299.9, 37.257436, -109.285202, '["direct-follow-mandatory"]'::jsonb),
  (14, 'Cortez', 'CO', 818.6, 2249.6, 37.353421, -108.546789, '[]'::jsonb),
  (15, 'Durango', 'CO', 862.8, 2205.4, 37.242638, -107.872614, '[]'::jsonb),
  (16, 'Pagosa Springs', 'CO', 917.1, 2151.1, 37.264420, -107.059320, '[]'::jsonb),
  (17, 'South Fork', 'CO', 963.8, 2104.4, 37.673398, -106.617254, '["altitude-pass"]'::jsonb),
  (18, 'Alamosa', 'CO', 1011.4, 2056.8, 37.473415, -105.838506, '[]'::jsonb),
  (19, 'La Veta', 'CO', 1070.1, 1998.1, 37.490049, -105.020546, '["altitude-pass"]'::jsonb),
  (20, 'Trinidad', 'CO', 1135.6, 1932.6, 37.181124, -104.484600, '["altitude-pass"]'::jsonb),
  (21, 'Kim', 'CO', 1206.9, 1861.3, 37.274587, -103.355821, '["no-services"]'::jsonb),
  (22, 'Walsh', 'CO', 1275.4, 1792.8, 37.398573, -102.251847, '[]'::jsonb),
  (23, 'Ulysses', 'KS', 1329.8, 1738.4, 37.562893, -101.305760, '["tz-change"]'::jsonb),
  (24, 'Montezuma', 'KS', 1379.9, 1688.3, 37.605246, -100.421651, '[]'::jsonb),
  (25, 'Greensburg', 'KS', 1446, 1622.2, 37.608496, -99.252648, '[]'::jsonb),
  (26, 'Pratt', 'KS', 1478.1, 1590.1, 37.645455, -98.674564, '[]'::jsonb),
  (27, 'Maize', 'KS', 1555.2, 1513, 37.781298, -97.423142, '[]'::jsonb),
  (28, 'El Dorado', 'KS', 1589.2, 1479, 37.817323, -96.851190, '[]'::jsonb),
  (29, 'Yates Center', 'KS', 1654, 1414.2, 37.879047, -95.692015, '[]'::jsonb),
  (30, 'Fort Scott', 'KS', 1714.1, 1354.1, 37.844636, -94.641511, '[]'::jsonb),
  (31, 'Weaubleau', 'MO', 1779.6, 1288.6, 37.904738, -93.499913, '[]'::jsonb),
  (32, 'Camdenton', 'MO', 1828.8, 1239.4, 38.038449, -92.706302, '[]'::jsonb),
  (33, 'Jefferson City', 'MO', 1885.5, 1182.7, 38.593202, -92.172958, '[]'::jsonb),
  (34, 'Washington', 'MO', 1962.7, 1105.5, 38.571086, -90.996655, '[]'::jsonb),
  (35, 'West Alton', 'MO', 2035, 1033.2, 38.900042, -90.149480, '[]'::jsonb),
  (36, 'Greenville', 'IL', 2081.1, 987.1, 38.897232, -89.341553, '[]'::jsonb),
  (37, 'Effingham', 'IL', 2130.1, 938.1, 39.105698, -88.515212, '[]'::jsonb),
  (38, 'Sullivan', 'IN', 2203.4, 864.8, 39.075806, -87.392611, '["tz-change"]'::jsonb),
  (39, 'Bloomington', 'IN', 2272.1, 796.1, 39.158626, -86.409490, '[]'::jsonb),
  (40, 'Greensburg', 'IN', 2333, 735.2, 39.323359, -85.414621, '[]'::jsonb),
  (41, 'Oxford', 'OH', 2382.9, 685.3, 39.507932, -84.677644, '[]'::jsonb),
  (42, 'Blanchester', 'OH', 2437.2, 631, 39.317365, -83.878438, '[]'::jsonb),
  (43, 'Chillicothe', 'OH', 2487.8, 580.4, 39.332909, -82.983557, '[]'::jsonb),
  (44, 'Athens', 'OH', 2553.3, 514.9, 39.317684, -81.987228, '[]'::jsonb),
  (45, 'West Union', 'WV', 2638.9, 429.3, 39.285128, -80.648251, '[]'::jsonb),
  (46, 'Grafton', 'WV', 2685.4, 382.8, 39.331594, -79.928720, '[]'::jsonb),
  (47, 'McHenry', 'MD', 2741.3, 326.9, 39.580184, -79.362756, '[]'::jsonb),
  (48, 'Cumberland', 'MD', 2790.3, 277.9, 39.691783, -78.654639, '[]'::jsonb),
  (49, 'Hancock', 'MD', 2827.5, 240.7, 39.717552, -78.110647, '[]'::jsonb),
  (50, 'Rouzerville', 'PA', 2876, 192.2, 39.739718, -77.437668, '[]'::jsonb),
  (51, 'Darlington', 'MD', 2959.2, 109, 39.646380, -76.133268, '[]'::jsonb),
  (52, 'Malaga', 'NJ', 3029.7, 38.5, 39.540108, -74.956420, '["shuttle-zone"]'::jsonb),
  (53, 'Atlantic City', 'NJ', 3066.4, 1.7, 39.353848, -74.437750, '[]'::jsonb),
  (54, 'Finish (Boardwalk)', 'NJ', 3068.1, 0, 39.353848, -74.437750, '[]'::jsonb)
on conflict (ts_num) do update set
  name = excluded.name,
  state = excluded.state,
  mile_total = excluded.mile_total,
  miles_to_fin = excluded.miles_to_fin,
  lat = excluded.lat,
  lng = excluded.lng,
  flags = excluded.flags;

-- Index on flags for fast section-rule queries.
create index if not exists time_station_flags_gin on time_station using gin (flags);
