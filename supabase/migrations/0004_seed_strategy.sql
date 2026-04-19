-- Seed strategy data from RAAM 2026 Crew Strategy Report (Kabir Rachure #610)
-- Target: Sub 10d 6h finish (12.2+ mph)

-- =========================
-- TARGET RACE PLAN
-- =========================
insert into target_plan (ts_num, target_arr_race_day, target_arr_time, target_speed_mph, notes) values
(0,  0, '16:00', null,  'Race start. Pre-loaded carbs 3h before.'),
(1,  0, '21:00', 17.6,  'Night riding. Target 2023 benchmark.'),
(2,  0, '23:30', 18.0,  'Stay on 2023 pace. Critical desert window.'),
(3,  1, '05:00', 14.5,  'Heat building. Pre-cool vest on at Brawley.'),
(4,  1, '08:00', 17.0,  'Nutrition checkpoint. Full feed stop max 8 min.'),
(5,  1, '12:00', 13.5,  'Peak heat. Ice socks, cooling towels ready.'),
(6,  1, '15:30', 15.0,  'Crew rotation checkpoint. New driver.'),
(7,  1, '22:00', 7.2,   'Sleep block #1: 25 min max before Prescott.'),
(8,  2, '02:30', 12.0,  'Night. Maintain 12+ mph through this section.'),
(10, 2, '08:00', 13.5,  'Daylight resumes. Strong push to Kayenta.'),
(11, 2, '13:00', 14.4,  'Sleep block #2: 20 min before Kayenta if needed.'),
(12, 2, '15:30', 17.0,  'Strong descent section. Take advantage.'),
(14, 2, '21:30', 13.0,  'Colorado entry. Begin altitude protocol.'),
(15, 3, '01:30', 11.0,  'Night in mountains. Warm layers essential.'),
(16, 3, '06:00', 12.0,  'Wolf Creek Pass ahead. Caffeine 90 min before.'),
(17, 3, '10:00', 12.0,  'Post-pass descent. Allow speed recovery.'),
(18, 3, '13:30', 13.5,  'San Luis Valley flatlands. Good speed zone.'),
(20, 3, '21:00', 11.5,  'Sleep block #3: 20 min at Trinidad.'),
(21, 4, '02:30', 12.0,  'Night on eastern CO plains. Hold 12+ mph.'),
(22, 4, '08:00', 13.5,  'Kansas approach. Final CO checkpoint.'),
(23, 4, '12:00', 13.5,  'CRITICAL: Sleep block #4 HERE — 25 min.'),
(24, 4, '15:30', 14.3,  'Flat Kansas. Maintain target pace.'),
(25, 4, '20:00', 13.5,  'Pre-night nutrition load before dark.'),
(26, 4, '22:00', 16.0,  'Night Kansas. CREW HIGHEST ALERT.'),
(27, 5, '04:00', 11.0,  'If speed <9 mph: emergency nap protocol.'),
(28, 5, '06:30', 13.6,  'Dawn. Strong push through Wichita area.'),
(30, 5, '14:30', 12.5,  'Kansas complete. Missouri entry.'),
(31, 5, '19:30', 13.0,  'Ozark Hills start. Pace management.'),
(33, 6, '02:00', 9.5,   'Sleep block #5: 20 min at Jefferson City.'),
(34, 6, '08:00', 11.0,  'Mississippi River approach.'),
(35, 6, '14:30', 11.0,  'Halfway mental boost. Celebrate and push.'),
(37, 6, '22:00', 11.5,  'Illinois flatlands. Night riding resumes.'),
(39, 7, '11:00', 10.2,  'Indiana. Sleep block #6: 20 min before Oxford.'),
(41, 7, '22:00', 10.8,  'Ohio entry. Final third of race begins.'),
(44, 8, '15:00', 10.5,  'Appalachian foothills. Pace will slow.'),
(45, 8, '24:00', 9.0,   'WV mountains. Accept 8-10 mph here.'),
(47, 9, '10:00', 9.5,   'Final push begins. Crew at maximum engagement.'),
(48, 9, '15:30', 10.5,  'C&O Canal approach. Mostly flat now.'),
(50, 9, '23:30', 10.5,  'Final 200 miles. No sleep stops.'),
(52, 10, '10:00', 10.5, 'Last checkpoint before Annapolis.'),
(54, 10, '22:00', 11.5, 'TARGET FINISH — Sub 10d 6h')
on conflict (ts_num) do nothing;

-- =========================
-- SLEEP BLOCKS (6 events, max 2h 30m total)
-- =========================
insert into sleep_block (event_num, location, race_day, max_duration_min, near_ts_num, skip_trigger) values
(1, 'Pre-Prescott AZ',    'Day 1 night',     25, 7,  'Speed still above 13 mph approaching Prescott'),
(2, 'Pre-Kayenta AZ',     'Day 2 afternoon', 20, 11, 'Daylight, temperature comfortable, speed >14 mph'),
(3, 'Trinidad CO',        'Day 3 evening',   20, 20, 'Arrived Trinidad before 19:00 local — skip, push to Kim CO'),
(4, 'Ulysses KS',         'Day 4 midday',    25, 23, 'NEVER SKIP — this is mandatory regardless of how good Kabir feels'),
(5, 'Jefferson City MO',  'Day 6 early AM',  20, 33, 'If arrived before midnight — push to Washington MO instead'),
(6, 'Pre-Oxford OH',      'Day 7 night',     20, 39, 'Within 700 miles of finish — only skip if mood and speed are strong')
on conflict (event_num) do nothing;

-- =========================
-- NIGHT WINDOWS (10 crash-risk zones)
-- =========================
insert into night_window (night_num, location, mile_start, mile_end, low_speed_2019, low_speed_2022, low_speed_2023, priority, assessment) values
(1,  'CA desert → AZ (Salome)',       200,  350,  7.1,  6.6,  14.8, 'HIGH',     '2023 beat this via fast early pace — timing shifted this window to daylight. Must replicate.'),
(2,  'AZ → UT (Kayenta area)',        550,  700,  7.1,  9.9,  7.4,  'CRITICAL', 'Consistent crash all 3 years at high altitude. Pre-emptive nap before Kayenta mandatory.'),
(3,  'CO Rockies (Pagosa→Alamosa)',   880,  980,  6.8,  null, 7.4,  'HIGH',     'High altitude + cold night. Warm layers staged in follow vehicle. Caffeine 90 min prior.'),
(4,  'CO/KS border (Trinidad→Walsh)', 1100, 1240, 5.8,  9.5,  9.7,  'HIGH',     'Variable. 2022 had a long sleep stop — nap must be max 25 min.'),
(5,  'Kansas plains (Ulysses→Greensburg)', 1290, 1410, 9.9, 6.2, 7.4, 'CRITICAL', 'Most consistent vulnerability. Flat terrain + fatigue day 4-5. This night decides the race.'),
(6,  'Missouri Ozarks (Camdenton area)', 1790, 1860, 8.0, 13.9, 6.8, 'HIGH', 'High variability. Rolling terrain punishes fatigue. 2022 good night here was likely a longer sleep.'),
(7,  'IL/IN border',                  2090, 2200, null, 8.0,  12.1, 'MEDIUM',   'If sleep debt is managed well, this night can be held at 11-12 mph. Key is days 5-6 nap quality.'),
(8,  'Indiana/Ohio',                  2290, 2400, 6.9,  10.7, 6.6,  'HIGH',     'Deep fatigue. Crew must be most alert here — road lighting, motivation, micro-nap before Oxford.'),
(9,  'Ohio/WV (Athens→West Union)',   2510, 2600, 9.3,  6.9,  7.2,  'HIGH',     'Consistent crash. Appalachian climbs amplify fatigue. Accept 8-10 mph target here.'),
(10, 'WV/MD (McHenry→Cumberland)',    2745, 2845, 11.1, 5.7,  10.3, 'CRITICAL', '2022 near-collapse here. Crew must have emergency stimulant and motivation protocol ready.')
on conflict (night_num) do nothing;

-- =========================
-- CRITICAL SEGMENTS
-- =========================
insert into critical_segment (from_station, to_station, mile_start, mile_end, speed_2019, speed_2022, speed_2023, best_speed, severity, notes) values
('Brawley CA',   'Blythe CA',        145,  235,  15.1, 9.5,  17.9, 17.9, 'CRITICAL', 'Gap 2022: -8.4'),
('Parker AZ',    'Salome AZ',        286,  342,  7.1,  6.6,  14.0, 14.0, 'CRITICAL', 'Gap 2022: -7.4'),
('Campo Verde',  'Winslow',          500,  546,  null, 4.4,  null, null, 'CRITICAL', 'STOP zone — only raced in 2022'),
('Tuba City',    'Kayenta',          575,  647,  12.2, 9.9,  16.3, 16.3, 'HIGH',     'Gap 2022: -6.4'),
('Kayenta',      'Mexican Hat',      647,  692,  7.1,  6.6,  17.9, 17.9, 'CRITICAL', 'Gap 2022: -11.3 — biggest single segment swing'),
('Ulysses',      'Greensburg KS',    1292, 1408, 9.9,  6.2,  15.1, 15.1, 'CRITICAL', 'Gap 2022: -8.9'),
('Yates Center', 'Ft Scott',         1616, 1676, 8.4,  7.1,  12.9, 12.9, 'HIGH',     'Gap 2022: -5.8'),
('West Union',   'Grafton WV',       2692, 2739, 9.2,  10.3, 7.3,  10.3, 'HIGH',     'Variable — sleep placement sensitive'),
('Grafton',      'McHenry MD',       2739, 2795, 11.1, 5.7,  10.3, 11.1, 'HIGH',     'Gap 2022: -5.4');

-- =========================
-- NUTRITION PHASES (4 race phases)
-- =========================
insert into nutrition_phase (id, phase_name, race_hour_start, race_hour_end, kcal_per_hr_low, kcal_per_hr_high, primary_source, hydration_ml_hr_low, hydration_ml_hr_high, key_risk) values
(1, 'Desert (CA/AZ)',      0,   36,  450, 500, 'Liquid carbs, gels, small rice cakes', 800, 1000, 'Hyponatraemia — include sodium'),
(2, 'Rockies (CO)',        36,  72,  400, 450, 'Liquid carbs, warm broth at night',    600, 700,  'Altitude suppresses appetite — force feed'),
(3, 'Plains (KS/MO)',      72,  130, 400, 400, 'Mixed solid/liquid. Real food at TS.', 500, 600,  'Flavour fatigue — rotate products'),
(4, 'Eastern (OH-MD)',     130, 246, 350, 400, 'Easy digestion — avoid high fat',      400, 500,  'Gut shutdown — small volumes frequently')
on conflict (id) do nothing;

-- =========================
-- CAFFEINE PROTOCOL
-- =========================
insert into caffeine_protocol (id, trigger_name, dose_mg, delivery_method) values
(1, 'Pre-night window (30 min before 22:00)',  100, 'Gel or tablet'),
(2, 'Night riding (every 90 min, 00:00-05:00)', 100, 'Cola or caffeine gel'),
(3, 'Emergency (speed crash <8 mph)',           200, 'Strong espresso or tablet'),
(4, 'Wind-down (post 05:00 if sleep planned)',  0,   'Avoid — blocks sleep quality'),
(5, 'Pre-Kansas (Day 4, 10:00 local)',          150, 'Pre-load before Ulysses')
on conflict (id) do nothing;

-- =========================
-- CONTINGENCY PLANS
-- =========================
insert into contingency_plan (scenario, severity, steps, sort_order) values
('Rider speed <8 mph for 20+ consecutive minutes (any time)', 'HIGH', array[
  'Stop safely off road. Announce "comfort stop" on radio.',
  'Assess: heat, fatigue, pain, or mechanical?',
  'If fatigue: implement emergency 20-min nap protocol + 200mg caffeine.',
  'If heat: full cooling — ice towels, move to shade, hydration.',
  'If pain: soigneur assesses; consider position change or tape.',
  'Navigator recalculates new TS arrival targets — inform rider only after restart.',
  'If no improvement after 2h: contact RAAM medical. Do not hide problems.'
], 1),
('Mechanical failure — wheel or drivetrain', 'HIGH', array[
  'Spare wheel change target: under 10 minutes.',
  'Mechanic must be at scene within 3 minutes of stop.',
  'Rider stays on rollers or does dynamic stretching — no sitting down.',
  'If chain/derailleur issue >15 min: consider spare bike swap.',
  'Log the incident time and inform navigator for TS recalc.'
], 2),
('Extreme heat (>42°C forecast in desert)', 'MEDIUM', array[
  'Pre-cooling session (ice vest 20 min before heat window).',
  'Ice socks in jersey at every crew stop.',
  'Cooling towels on neck and wrists every 20 min during peak heat.',
  'Increase sodium in drinks — target 800mg/L during extreme heat.',
  'Consider 2-hr pre-dawn acceleration to bank miles before peak heat.'
], 3),
('Thunderstorm / lightning (Plains and Appalachians)', 'MEDIUM', array[
  'At first lightning within 10km: rider in vehicle immediately.',
  'Wait minimum 30 min after last lightning before resuming.',
  'Time lost: log and recalculate. Do not rush restart.',
  'Wet roads in Appalachians: reduce speed 15% on descents.'
], 4),
('Mental crisis / low morale (Day 5-7 most common)', 'HIGH', array[
  'Primary contact: pre-designated crew "buddy" (rider selects pre-race).',
  'Do NOT show race time gaps or competitor positions during a low.',
  'Use pre-written personal messages from family (sealed envelopes, opened by crew when needed).',
  'Focus on next immediate milestone only — never the finish.',
  'If rider asks to stop: "Let''s just get to [next town] first." Repeat.',
  'Offer a 20-min nap — sometimes crisis is sleep not morale.'
], 5),
('Penalty risk', 'MEDIUM', array[
  'Navigator must review RAAM rules before race for current year updates.',
  'Traffic violations: immediate stop — no race position is worth a DQ.',
  'Time station documentation: photograph every TS sign on arrival.',
  'Crew vehicle lighting: check compliance every evening before dark.',
  '2022 penalty cost 1 hour — equivalent to ~11 miles at race pace.'
], 6);

-- =========================
-- PRE-RACE CHECKLISTS
-- =========================
insert into pre_race_checklist (stage, item, sort_order) values
('12 weeks', 'FTP test — establish current power baseline', 1),
('12 weeks', 'Begin altitude training or heat acclimatisation blocks', 2),
('12 weeks', 'Finalise all nutrition products — no new products after this date', 3),
('12 weeks', 'Crew confirmed, roles assigned, travel booked', 4),
('12 weeks', 'Bike fit finalised — zero changes after 8 weeks out', 5),
('12 weeks', 'Study RAAM rulebook — current year edition', 6),
('12 weeks', 'Confirm vehicle (follow + lead) mechanical check and lighting compliance', 7),
('4 weeks',  'Final long training block complete (back-to-back 200mi+ days)', 1),
('4 weeks',  'All race gear tested in night conditions', 2),
('4 weeks',  'Crew briefing session — review this document together', 3),
('4 weeks',  'Sleep strategy rehearsed in training (polyphasic nap timing)', 4),
('4 weeks',  'TS arrival target spreadsheet built and distributed to all crew', 5),
('4 weeks',  'Medical kit stocked: electrolytes, anti-chafe, pain relief, wound care', 6),
('4 weeks',  'Spare bike fully built and dialled', 7),
('48 hours', 'Carbohydrate loading begins', 1),
('48 hours', 'All crew vehicles fuelled, stocked with 3 days food float', 2),
('48 hours', 'Radio comms tested on all channels', 3),
('48 hours', 'Personal messages from family sealed and given to crew lead', 4),
('48 hours', 'Weather forecast reviewed — plan for Salome and Prescott windows specifically', 5),
('48 hours', 'All RAAM registration paperwork confirmed', 6),
('48 hours', 'Rider sleep: full nights Thursday and Friday before Saturday start', 7),
('race day', 'Wake 4h before start — normal breakfast', 1),
('race day', 'Bike final check: tyres at race pressure, drivetrain clean, lights charged', 2),
('race day', 'All nutrition for first 12h loaded in follow vehicle', 3),
('race day', 'Crew rotation schedule confirmed and printed', 4),
('race day', 'Rider TS targets sheet printed and laminated in follow vehicle', 5),
('race day', 'Emergency contacts list posted in both vehicles', 6),
('race day', 'Timing: depart for start 2h early — no rushing', 7);

-- =========================
-- CREW ROLE SPECIALISATIONS
-- =========================
insert into crew_role_spec (id, role_name, responsibility, shift_pattern, critical_skill) values
(1, 'Navigator / Race Director', 'TS tracking, time vs target, rule compliance, all decisions', '12h on / 12h off (alternating)', 'RAAM rules knowledge; calm under pressure'),
(2, 'Driver — Follow Vehicle',   'Safe leapfrog, lighting, proximity management',              '6h on / 6h off (3-person rotation)', 'Night driving; patience'),
(3, 'Soigneur / Feeder',         'All nutrition delivery, kit changes, body maintenance',      '8h on / 8h off',             'Nutrition timing; wound care'),
(4, 'Mechanic',                   'Bike maintenance, emergency repairs, spare bikes',           'On-call; sleep when stable', 'Sub-15 min wheel change'),
(5, 'Medic / Wellness Lead',     'Vital monitoring, skin checks, sleep calls, mental health',  '12h on / 12h off',           'Recognise Type 2 Fun vs real crisis'),
(6, 'Logistics / Comms',         'Fuel, food restocks, TS communications, weather monitoring', 'Flexible; supports all roles', 'Advance planning; 48h food float')
on conflict (id) do nothing;

-- =========================
-- RACE PROTOCOL CONSTANTS
-- =========================
insert into race_protocol (key, value, description) values
('90_minute_rule', '9 mph / 15 min',
 'Any time Kabir''s speed drops below 9 mph for 15+ continuous minutes during a night window, the crew must immediately implement the sleep intervention protocol — pull over safely, 20-minute nap, caffeinated nutrition, warm layers if needed. Do NOT allow riding below 8 mph for more than 20 minutes. The time lost stopping is always less than the time lost to a prolonged low-speed spiral.'),
('wake_protocol', '4 min roll-time',
 'Every sleep stop uses a 25-min timer maximum. Crew role for wake-up: gentle voice first, then caffeine (200mg) administered immediately, then gentle movement (30 sec mobilisation) before mounting bike. Rider must be rolling within 4 minutes of wake. The person who wakes the rider must stay calm — never urgent/panicked — regardless of time vs target.'),
('target_finish', 'Sub 10d 6h (12.2+ mph)',
 '2026 finish goal. Gains must come from Kansas night (+4-6h), Appalachian late-race (+2h), higher FTP, better sleep architecture.'),
('sleep_budget', '2h 30m total',
 'Target: 6 micro-sleep events of 20-25 min each. Timed to natural circadian dips (01:00-04:00 local). Pre-empted BEFORE fatigue becomes critical.'),
('nutrition_target', '400-500 kcal/hr on-bike',
 'Primary source liquid/gel. Solid food at planned crew stops only. Gut issues top DNF risk — never experiment with new products during race.')
on conflict (key) do nothing;
