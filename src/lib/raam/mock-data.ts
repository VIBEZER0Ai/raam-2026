/**
 * Mock operational data for screens where Supabase tables are defined
 * but not yet seeded (alerts, crew, vehicles, weather, nutrition_log).
 * Will be replaced with live queries as each module is wired.
 */

export interface MockCrew {
  id: string;
  initials: string;
  name: string;
  role: string;
  color: string;
  vehicle: string;
  status: "ON DUTY" | "SLEEPING" | "DRIVING" | "OFF";
  loc: string;
  tag: string;
  shift: string;
}

export interface MockVehicle {
  id: string;
  name: string;
  call: string;
  driver: string;
  drInit: string;
  drColor: string;
  shift: string;
  rotate: string;
  crew: string[];
  speed: number;
  near: string;
  dist: string;
  live: string;
}

export interface MockAlert {
  id: string;
  sev: "CRITICAL" | "WARN" | "INFO" | "AMBER";
  title: string;
  meta: string;
  body?: string;
}

export interface MockWeatherSegment {
  from: string;
  to: string;
  miles: number;
  wind: number;
  dir: string;
  temp: string;
  impact: number;
  when: string;
}

export interface MockNutritionEntry {
  t: string;
  what: string;
  who: string;
  c: number;
  w: number;
  s: number;
}

/** Current pacing state for previews — will be derived from gps_ping when live. */
export const RACE_STATE = {
  currentTs: 14,
  currentMile: 781.4,
  currentSpeed: 13.8,
  elapsed: "2d 8h 12m",
  targetDelta: "-0h 18m",
  avgSpeed: 12.6,
};

export const CREW: MockCrew[] = [
  { id: "sapna",  initials: "SR", name: "Sapna Rachure", role: "Crew Chief",     color: "#fc4c02", vehicle: "RV",      status: "ON DUTY",  loc: "RV · 4.2 mi back",        tag: "AirTag 12s ago",   shift: "started 3h 24m ago" },
  { id: "vishal", initials: "VB", name: "Vishal Behal",  role: "C&C Operator",   color: "#f59e0b", vehicle: "RV",      status: "ON DUTY",  loc: "RV · 4.2 mi back",        tag: "AirTag live",      shift: "started 5h 10m ago" },
  { id: "adit",   initials: "AR", name: "Aditya R.",     role: "Follow driver",  color: "#34d399", vehicle: "Follow",  status: "DRIVING",  loc: "Follow · 0.3 mi behind",  tag: "Live Share ACTIVE", shift: "4h 12m · rotate 0h 48m" },
  { id: "nav",    initials: "NJ", name: "Navya J.",      role: "Follow crew",    color: "#34d399", vehicle: "Follow",  status: "ON DUTY",  loc: "Follow · 0.3 mi behind",  tag: "AirTag 1m ago",    shift: "started 4h 12m ago" },
  { id: "rav",    initials: "RK", name: "Ravi K.",       role: "Shuttle driver", color: "#60a5fa", vehicle: "Shuttle", status: "DRIVING",  loc: "Shuttle · 11.6 mi back", tag: "Live Share ACTIVE", shift: "2h 40m · rotate 3h 20m" },
  { id: "meh",    initials: "MP", name: "Mehul P.",      role: "Shuttle crew",   color: "#60a5fa", vehicle: "Shuttle", status: "ON DUTY",  loc: "Shuttle · 11.6 mi back", tag: "AirTag 2m ago",    shift: "started 2h 40m ago" },
  { id: "neha",   initials: "NP", name: "Neha P.",       role: "Soigneur",       color: "#818cf8", vehicle: "RV",      status: "SLEEPING", loc: "RV · bunk 2",             tag: "AirTag 6m ago",    shift: "rest 1h 14m / 90m cap" },
  { id: "arj",    initials: "AK", name: "Arjun K.",      role: "Mechanic",       color: "#818cf8", vehicle: "RV",      status: "OFF",      loc: "RV · bench",              tag: "AirTag 18m ago",   shift: "off 2h 10m" },
  { id: "pri",    initials: "PS", name: "Priya S.",      role: "Media",          color: "#ec4899", vehicle: "Shuttle", status: "ON DUTY",  loc: "Shuttle · 11.6 mi back", tag: "AirTag 1m ago",    shift: "started 3h 30m ago" },
  { id: "rah",    initials: "RB", name: "Rahul B.",      role: "Nav / Routing",  color: "#f59e0b", vehicle: "Follow",  status: "OFF",      loc: "Follow · jump seat",      tag: "AirTag OFFLINE 34m", shift: "off 1h 22m" },
];

export const VEHICLES: MockVehicle[] = [
  { id: "follow",  name: "Follow Vehicle", call: "ALPHA-1",   driver: "Aditya R.", drInit: "AR", drColor: "#34d399", shift: "4h 12m", rotate: "0h 48m", crew: ["AR", "NJ", "RB"],       speed: 13.6, near: "Montezuma Creek, UT", dist: "0.3 mi behind", live: "ACTIVE" },
  { id: "shuttle", name: "Shuttle",        call: "BRAVO-2",   driver: "Ravi K.",   drInit: "RK", drColor: "#60a5fa", shift: "2h 40m", rotate: "3h 20m", crew: ["RK", "MP", "PS"],       speed: 62,   near: "US-160 W",            dist: "11.6 mi back",  live: "ACTIVE" },
  { id: "rv",      name: "RV / War Room",  call: "CHARLIE-3", driver: "Sunil M.",  drInit: "SM", drColor: "#fc4c02", shift: "3h 24m", rotate: "2h 36m", crew: ["SR", "VB", "NP", "AK"], speed: 54,   near: "US-160 W",            dist: "4.2 mi back",   live: "ACTIVE" },
];

export const ALERTS: MockAlert[] = [
  { id: "a1", sev: "CRITICAL", title: "Follow vehicle 0.72 mi from Kabir at night", meta: "RULE-16 · 00:47 EDT", body: "Night protocol requires follow vehicle within 30 ft direct follow." },
  { id: "a2", sev: "WARN",     title: "Headwind 22 mph next segment — −1.8 mph pace", meta: "TS14 → TS15",       body: "Pre-cool + aero tuck." },
  { id: "a3", sev: "WARN",     title: "Carbs 42g last hour (target 60–90g)",           meta: "Nutrition · 01:12", body: "Prep 60g feed at mi 795." },
  { id: "a4", sev: "INFO",     title: "Shift rotation in 48 min for Follow driver",    meta: "Aditya R. · 5.5h cap", body: "Pre-stage relief at TS15." },
];

export const WEATHER_NOW = {
  temp: 92,
  feels: 98,
  wind: 14,
  windDir: "NE",
  windDeg: 45,
  precip: 0,
  cond: "Clear",
  visibility: "10 mi",
};

export const WEATHER_SEGMENTS: MockWeatherSegment[] = [
  { from: "TS14 Cortez",        to: "TS15 Durango",        miles: 44.2, wind: 22, dir: "NE", temp: "86–94°F", impact: -1.8, when: "22:14 MDT" },
  { from: "TS15 Durango",       to: "TS16 Pagosa Springs", miles: 54.3, wind: 9,  dir: "E",  temp: "68–82°F", impact: -0.4, when: "04:40 MDT" },
  { from: "TS16 Pagosa Springs", to: "TS17 South Fork",    miles: 47.9, wind: 6,  dir: "SW", temp: "56–71°F", impact: 0.2,  when: "09:20 MDT" },
  { from: "TS17 South Fork",    to: "TS18 Alamosa",        miles: 46.6, wind: 18, dir: "NW", temp: "54–70°F", impact: -1.2, when: "13:15 MDT" },
  { from: "TS18 Alamosa",       to: "TS19 La Veta",        miles: 58.3, wind: 24, dir: "N",  temp: "58–74°F", impact: -2.1, when: "17:10 MDT" },
  { from: "TS19 La Veta",       to: "TS20 Trinidad",       miles: 65.4, wind: 10, dir: "E",  temp: "62–80°F", impact: -0.5, when: "22:40 MDT" },
  { from: "TS20 Trinidad",      to: "TS21 Kim",            miles: 71.3, wind: 14, dir: "S",  temp: "66–86°F", impact: 0.3,  when: "05:10 CDT" },
  { from: "TS21 Kim",           to: "TS22 Walsh",          miles: 68.4, wind: 16, dir: "SW", temp: "70–92°F", impact: -0.6, when: "11:40 CDT" },
];

export const NUTRITION_LOG: MockNutritionEntry[] = [
  { t: "01:12", what: "60g carb gel",      who: "Neha",   c: 60, w: 0,   s: 0 },
  { t: "00:58", what: "500 ml + 500mg Na", who: "Neha",   c: 0,  w: 500, s: 500 },
  { t: "00:27", what: "40g maltodextrin",  who: "Neha",   c: 40, w: 250, s: 0 },
  { t: "23:58", what: "Banana + 30g",      who: "Aditya", c: 45, w: 0,   s: 120 },
  { t: "23:22", what: "750ml + 400mg Na",  who: "Aditya", c: 0,  w: 750, s: 400 },
  { t: "22:49", what: "80g rice cake",     who: "Neha",   c: 80, w: 0,   s: 150 },
];

/** Per-TS target overrides (mocked until target_plan is queried directly everywhere). */
export const TARGETS: Record<number, { day: number; time: string; spd: number; delta: string | null }> = {
  14: { day: 2, time: "20:15 MDT", spd: 13.4, delta: "-0h 18m" },
  15: { day: 2, time: "23:30 MDT", spd: 13.0, delta: null },
  16: { day: 3, time: "04:00 MDT", spd: 12.8, delta: null },
  17: { day: 3, time: "08:15 MDT", spd: 12.6, delta: null },
  18: { day: 3, time: "13:00 MDT", spd: 12.2, delta: null },
};
