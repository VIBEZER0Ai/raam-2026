-- RAAM 2026 Rule catalog seed — 2026 RAAM Rules PDF + Team Kabir strategy
-- Every rule here renders in /compliance. Sub-set are evaluated by the TS engine.

insert into rule (code, category, kind, severity, name, description, source_ref, dq_trigger, sort_order) values

-- ===================== TIME / RRS =====================
('1440_RRS_CHECKIN_30MIN', 'time', 'require', 'warn',
 'RRS check-in within 30 min of TS arrival',
 'Upon Racer arrival at each Time Station, crew must check-in via RRS within 30 minutes (not before). Habitual delay/multiple check-ins may result in a penalty.',
 'Rule 1440', false, 10),

('1442_GPS_TRACKER_60MIN', 'time', 'require', 'critical',
 'GPS tracker must not silence >60 min',
 'If RAAM-issued GPS Tracker fails to read Racer location for more than 60 minutes, Crew Chief must immediately call Race HQ. Repeated failures risk penalty or DQ.',
 'Rule 1442', false, 11),

('288H_HARD_CUTOFF', 'time', 'require', 'critical',
 '288h hard cutoff at Atlantic City (Solo Men Under 50)',
 'Must cross finish line at or before Mon Jun 29, 2026 15:00 EDT. No extensions. Missing hard cutoff = DNF.',
 'Rules p.5', false, 1),

('81H_TS15_SOFT_CUTOFF', 'time', 'monitor', 'warn',
 'TS15 Durango soft cutoff (+81h)',
 'Reach TS15 by Sat Jun 20, 2026 24:00 EDT to avoid Race Management reviewing continuation.',
 'Rules p.5', false, 2),

('192H_TS35_SOFT_CUTOFF', 'time', 'monitor', 'warn',
 'TS35 Mississippi soft cutoff (+192h)',
 'Reach TS35 by Wed Jun 24, 2026 15:00 EDT.',
 'Rules p.5', false, 3),

-- ===================== NIGHT PROTOCOL =====================
('1460_NIGHT_DIRECT_FOLLOW', 'night', 'require', 'critical',
 'Direct Follow Support mandatory at night',
 'From 19:00 to 07:00 local (or visibility <1000 ft): Follow Vehicle must stay directly behind Racer within 30 feet. Riding under night conditions without Direct Follow may result in DQ.',
 'Rule 1460', true, 20),

('1420_NO_ROLLING_NIGHT', 'night', 'prohibit', 'warn',
 'Rolling exchanges prohibited at night',
 'All racer exchanges at night must be stationary. Rolling exchange at night can trigger 1h penalty.',
 'Rule 1420.6', false, 21),

('1405_NO_LEAPFROG_NIGHT', 'night', 'prohibit', 'warn',
 'Leapfrog support prohibited at night',
 'Only Direct Follow permitted at night. No leapfrog.',
 'Definitions · Leapfrog Support', false, 22),

('1460_30FT_FOLLOW', 'night', 'require', 'warn',
 'Follow vehicle within 30 ft at night',
 'Rider must never leave Follow Vehicle headlights. More than 30 ft at night = warning → penalty.',
 'Rule 1460', false, 23),

('900_CREW_REFLECTIVE_NIGHT', 'night', 'require', 'warn',
 'Crew reflective vest + ankle/wrist bands at night',
 'Every crew member on duty must wear DOT-approved reflective vest and ankle or wrist bands during night conditions.',
 'Rule 900 · 1460', false, 24),

-- ===================== GEOGRAPHIC =====================
('1405_AZ_LEAPFROG', 'geo', 'require', 'warn',
 'AZ: Leapfrog mandatory, day only (Camino del Rey → US89/US160)',
 'In this zone during Day Time, Leapfrog is MANDATORY — Follow Vehicle impeding traffic = penalty. Night = Direct Follow mandatory.',
 'Rule 1405.2', false, 30),

('1405_UT_DIRECT_FOLLOW', 'geo', 'require', 'warn',
 'UT: Direct Follow mandatory day + night (US89/US160 → UT/CO line)',
 'Direct Follow mandatory regardless of time. Racer cannot advance without Follow Vehicle.',
 'Rule 1405.2', true, 31),

('1405_CO_LEAPFROG_DAY', 'geo', 'require', 'warn',
 'CO: Day Leapfrog mandatory, Direct Follow prohibited',
 'From UT/CO state line to CO/KS state line: Day Time Leapfrog mandatory, Direct Follow prohibited during day. Night = Direct Follow mandatory.',
 'Rule 1405.2', true, 32),

('SHUTTLE_OAK_CREEK', 'geo', 'monitor', 'info',
 'Oak Creek Canyon shuttle — +1h fixed (Solo)',
 'All racers shuttled through Sedona + Oak Creek Canyon (20.1 mi). Solo division gets +1 hour added to total time.',
 'GEAR p.20', false, 33),

('SHUTTLE_DELAWARE', 'geo', 'monitor', 'info',
 'Delaware Memorial Bridge shuttle',
 'All racers shuttled across Delaware Memorial Bridge (4.6 mi). No time adjustment.',
 'GEAR p.20', false, 34),

-- ===================== SAFETY / EQUIPMENT =====================
('620_FRONT_HEADLIGHT', 'safety', 'require', 'warn',
 'Front white headlight visible 500 ft — on always',
 'Bicycle must have front white headlight mounted, visible from 500 ft, on at all times while on road (day + night).',
 'Rule 620', false, 40),

('630_REAR_TAILLIGHT', 'safety', 'require', 'warn',
 'Rear red taillight visible 500 ft — on always',
 'Bicycle must have red rear taillight visible from 500 ft, on at all times while on road.',
 'Rule 630', false, 41),

('640_REFLECTIVE_TAPE', 'safety', 'require', 'info',
 'Reflective tape: 8 pieces per wheel + both crank arms',
 'Four pieces of reflective tape minimum on BOTH sides of every wheel (8 per wheel). Crank arms fully wrapped.',
 'Rule 640', false, 42),

('535_AMBER_LIGHTS', 'safety', 'require', 'warn',
 'Support vehicle roof-mounted amber flashing lights',
 'All support vehicles must have two amber flashing lights on roof rack. On whenever providing support.',
 'Rule 535 · 565', false, 43),

('545_SMV_TRIANGLE', 'safety', 'require', 'warn',
 'Slow-moving vehicle triangle on Follow Vehicle',
 'DOT standard orange reflective SMV triangle (12" sides, 1.5" red border) on rear when Direct Follow behind Racer.',
 'Rule 545', false, 44),

-- ===================== SUPPORT VEHICLE =====================
('1450_2MIN_IMPEDE', 'support', 'prohibit', 'warn',
 'Follow vehicle must not impede traffic >2 min',
 'Pull off and let traffic pass if 2+ vehicles waiting or 1 vehicle held for >2 min.',
 'Rule 1450', false, 50),

('1455_NO_CARAVANNING', 'support', 'prohibit', 'warn',
 'No caravanning — 2+ vehicles same speed >30 sec',
 'Two or more support vehicles behind a racer at same speed for more than 30 seconds = caravanning. Prohibited at all times.',
 'Rule 1455', false, 51),

('565_4_PASS_PER_HR', 'support', 'prohibit', 'warn',
 'Max 4 passes per hour of racer by support vehicle',
 'Support vehicle may not pass racer more than 4 times per hour (except during leapfrog support).',
 'Rule 565', false, 52),

-- ===================== RACER =====================
('830_LEFT_EAR_CLEAR', 'racer', 'require', 'warn',
 'Left ear must be clear of headphones while racing',
 'Only right ear may be fed sound. Left ear always clear for traffic awareness.',
 'Rule 830', false, 60),

('800_NO_DRAFT_100FT', 'racer', 'require', 'warn',
 'Racer must maintain 100 ft from other racers/vehicles',
 'No drafting. 100 ft minimum spacing from other racers and support vehicles.',
 'Rule 800', false, 61),

('800_NO_MOTION_ADJUST', 'racer', 'prohibit', 'warn',
 'No adjustments to bike or clothing while racer in motion',
 'Crew may not make adjustments or repairs to bike, equipment, or clothing while racer is moving.',
 'Rule 800 · 1410', false, 62),

-- ===================== PENALTY / DQ =====================
('240_5_PENALTY_DQ', 'penalty', 'monitor', 'critical',
 '5 penalties = automatic DQ',
 'Accumulation of 5 × 1-hour penalties triggers DQ by Executive Management.',
 'Rule 240', true, 70),

-- ===================== NUTRITION (strategy) =====================
('FEED_CARBS_60_90', 'nutrition', 'require', 'warn',
 'Carbs 60-90 g/hr during racing',
 'Hourly carb target: 60-90g. Below 42g for 1h = feed deficit alert.',
 'Strategy · Feed plan', false, 80),

('FEED_HYDRATION_500_750', 'nutrition', 'require', 'warn',
 'Water 500-750 ml/hr depending on phase',
 'Desert phase top end (750ml). Eastern phase bottom end (400ml). Sodium 500-800 mg/L in heat.',
 'Strategy · Feed plan', false, 81),

-- ===================== SLEEP =====================
('90_MIN_RULE', 'sleep', 'trigger', 'critical',
 '90-min rule: <9 mph × 15 min = forced sleep',
 'Any night window where speed drops below 9 mph for 15+ continuous minutes triggers mandatory sleep intervention: pull over, 20-min nap, caffeine, warm layers. Never allow <8 mph >20 min.',
 'Strategy · p.4', false, 90),

('SLEEP_BLOCK_4_NEVER_SKIP', 'sleep', 'require', 'critical',
 'Sleep #4 (Ulysses KS) — NEVER skip',
 'Day 4 midday mandatory 25-min sleep block. This single intervention is the highest-impact fatigue management decision of the race.',
 'Strategy · Sleep plan', false, 91),

('SHERMERS_AWAKE_RECOVERY', 'sleep', 'monitor', 'warn',
 'Shermer''s neck risk: awake hours × (100 − recovery %)',
 'Crew tracks awake hours and Whoop recovery %. Product > 1200 = HIGH risk. > 1500 = CRITICAL — consider pulling rider.',
 'Strategy · Risks', false, 92)

on conflict (code) do nothing;
