/**
 * Help corpus for new teams transitioning from pen-and-paper.
 *
 * Each article is a typed object with structured `Block`s. Renderer turns
 * blocks into accessible HTML + a clean print stylesheet so /handbook
 * doubles as a printable PDF (browser → Save as PDF).
 *
 * Content style:
 *   - Plain English, second person ("you")
 *   - One paragraph per concept, max
 *   - Always lead with the action, then the why
 *   - Cross-reference with /help/<slug> when needed
 */

export type HelpGroup =
  | "start"
  | "live-ops"
  | "data"
  | "lifecycle"
  | "reference";

export interface HelpArticle {
  slug: string;
  title: string;
  group: HelpGroup;
  blurb: string;
  /** Estimated read time in minutes. */
  readMin: number;
  blocks: Block[];
}

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "callout"; tone: "info" | "warn" | "good" | "danger"; title?: string; text: string }
  | { kind: "kv"; rows: { k: string; v: string }[] }
  | { kind: "code"; lang?: string; text: string }
  | { kind: "step"; n: number; title: string; text: string };

export const HELP_GROUPS: { id: HelpGroup; label: string; desc: string }[] = [
  { id: "start",     label: "Start here",        desc: "5-minute tour for new crew" },
  { id: "live-ops",  label: "During the race",   desc: "What to do, screen by screen" },
  { id: "data",      label: "Data + devices",    desc: "GPS, weather, vehicles, sensors" },
  { id: "lifecycle", label: "Before + after",    desc: "Setup, debrief, settings" },
  { id: "reference", label: "Reference",         desc: "Glossary, troubleshooting, contacts" },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "quick-start",
    title: "Quick start — your first 5 minutes",
    group: "start",
    readMin: 5,
    blurb:
      "Crew chief signs in, picks the team, opens War Room, knows where everything is.",
    blocks: [
      { kind: "p", text:
          "Ventor replaces the white-board, the WhatsApp scroll-back, and the printed cue sheet. Everything you used to write on paper now lives in one screen the whole crew shares. Here is how to land in the right place." },
      { kind: "step", n: 1, title: "Sign in", text:
          "Open ventor.fit on your phone or laptop. Sign in with the email the crew chief invited. If you didn't get an invite, ask the chief to add you under Admin → Roster." },
      { kind: "step", n: 2, title: "Land on War Room", text:
          "After login the home tab is War Room — Kabir's live position, alerts, vehicles, weather, stops. Most of the day-to-day happens here." },
      { kind: "step", n: 3, title: "Know your role", text:
          "Tap the avatar (top right). It shows your role: chief, crew, rider, or observer. Each role can do different things — observers can read but not change data." },
      { kind: "step", n: 4, title: "Pick the right units", text:
          "Same avatar menu has a Units toggle. Indian crew typically wants metric (km, °C). Toggle once and the whole app converts on the fly." },
      { kind: "step", n: 5, title: "Bookmark these tabs", text:
          "Operate → War Room, Crew, Vehicles, Time Stations, Nutrition, Sleep, Compliance, Comms, Weather. Plan → Pre-race, Bikes, Debrief. Team → Admin, Roster, Spectator." },
      { kind: "callout", tone: "info", title: "First-time tip", text:
          "If a screen looks empty, that's because no data has been pushed yet (e.g. pre-race). It will fill in automatically when crew + rider start posting." },
    ],
  },
  {
    slug: "war-room",
    title: "War Room — the live dashboard",
    group: "live-ops",
    readMin: 4,
    blurb:
      "What every panel on the home tab means, top to bottom.",
    blocks: [
      { kind: "p", text:
          "War Room is your situational awareness in one screen. Scroll top to bottom; do not lose time hunting for info." },
      { kind: "h", text: "Top header" },
      { kind: "ul", items: [
          "Race state pill — PRE / LIVE / FIN / CUTOFF.",
          "Elapsed clock — total time since the official RAAM start (Eastern Daylight Time, locked).",
          "Cutoff clock — countdown to the 288-hour solo cap.",
          "Alerts bell — current open alerts; tap to skim.",
        ] },
      { kind: "h", text: "Body" },
      { kind: "ul", items: [
          "Separation banner (only when needed) — red if Follow ↔ Leapfrog vehicles drift more than 30 minutes apart.",
          "Position card — Kabir's current mile, current TS, current speed, age of last GPS fix.",
          "Alerts list — open compliance + race alerts, ranked by severity.",
          "Weather glance — temperature + wind component for next stretch.",
          "Stop request panel — see active stops + create new ones (15-min rule).",
        ] },
      { kind: "h", text: "Footer" },
      { kind: "p", text:
          "The bottom strip is fixed — distance done, distance to finish, average speed, TS progress, elapsed, target delta. It follows you on every screen so you never lose the basics." },
      { kind: "callout", tone: "good", title: "Habit to build", text:
          "Glance at War Room every shift change. 10 seconds tells you if everything is on plan." },
    ],
  },
  {
    slug: "stop-requests",
    title: "Stop requests — the 15-minute rule",
    group: "live-ops",
    readMin: 3,
    blurb:
      "How to ask Kabir to stop without breaking his rhythm. Mech and medical bypass the wait.",
    blocks: [
      { kind: "p", text:
          "Kabir's request: any unplanned stop must give him a 15-minute heads-up so he can plan effort, food, hydration, and bathroom around it. Mechanical or medical issues bypass this — they dispatch immediately." },
      { kind: "h", text: "How to file a request" },
      { kind: "ol", items: [
          "Open War Room. Find the Stop requests panel.",
          "Tap + Request stop.",
          "Pick a reason chip — Loo, Food, Mech, Medical, Sleep, Media, Other.",
          "Add an optional note (e.g. 'driver needs coffee, 5 km ahead').",
          "Tap Send. The 15-minute counter starts. Mech + Medical chips dispatch instantly.",
        ] },
      { kind: "h", text: "Lifecycle of a request" },
      { kind: "kv", rows: [
          { k: "pending", v: "Counter ticking. Rider has not acknowledged yet." },
          { k: "acknowledged", v: "Rider tapped ✓ — knows the stop is coming." },
          { k: "dispatched", v: "Rider has stopped. Crew is now executing." },
          { k: "cancelled", v: "Crew cancelled (e.g. found alt, rider declined)." },
        ] },
      { kind: "callout", tone: "warn", title: "Rule of thumb", text:
          "If you'd otherwise just shout it on the walkie, file a stop request instead. The whole crew sees it, the rider sees it, the timeline keeps a record." },
    ],
  },
  {
    slug: "vehicles-and-tracking",
    title: "Vehicles + live tracking",
    group: "live-ops",
    readMin: 4,
    blurb:
      "How Follow + Leapfrog vehicles stay synced + how to push GPS from a phone.",
    blocks: [
      { kind: "p", text:
          "Two vehicles, one rule: stay within 30 minutes of each other at current speed. The app enforces this and flags drift in red on War Room." },
      { kind: "h", text: "Tracking from a crew phone" },
      { kind: "ol", items: [
          "Open /vehicles on the on-duty crew phone.",
          "Tap Track from this phone on the right vehicle (Follow-1 or Leap-1).",
          "Allow location permission.",
          "Pick the Driver and Navigator from the dropdowns.",
          "Tap Start tracking. Pings post every 30 seconds while the tab is open.",
          "Add to home screen for native-feel persistence.",
        ] },
      { kind: "callout", tone: "info", title: "Why phone GPS is enough", text:
          "Phone GPS is more accurate than the Garmin tracker for support vehicles. Garmin is the secondary source. RAAM live tracker is rider-only." },
      { kind: "h", text: "If pings stop arriving" },
      { kind: "ul", items: [
          "Phone went to sleep — keep the tab visible, or use Add to Home Screen.",
          "Permission was revoked — re-allow in browser settings.",
          "No signal — pings buffer briefly then drop. Move to the next ridge.",
          "Vehicle marked inactive — only chief can reactivate via /admin/roster (coming soon).",
        ] },
    ],
  },
  {
    slug: "weather",
    title: "Reading the weather + headwinds",
    group: "live-ops",
    readMin: 3,
    blurb:
      "Open-Meteo data per time station + signed wind component. Plan sleep around bad weather, not in spite of it.",
    blocks: [
      { kind: "p", text:
          "Weather is fetched from Open-Meteo every 15 minutes for the rider position and the next six time stations. The app classifies wind into headwind / tailwind / crosswind based on the segment bearing — not the raw direction." },
      { kind: "h", text: "Wind component reading" },
      { kind: "kv", rows: [
          { k: "+ value (green)", v: "Tailwind. Push harder, take less food." },
          { k: "− value (red)",   v: "Headwind. Drop into aero, conserve effort." },
          { k: "near zero",       v: "Crosswind — Follow vehicle drives closer to block." },
        ] },
      { kind: "h", text: "Auto-action triggers" },
      { kind: "ul", items: [
          "Headwind > 15 km/h → WARN aero tuck + reduce 5%",
          "Temp > 35 °C → AMBER pre-cool + ice socks",
          "Temp < 7 °C → INFO stage warm layers in follow",
          "Precip > 2 mm → WARN rain shell + check tire grip",
        ] },
      { kind: "callout", tone: "good", title: "Tactical sleep", text:
          "When a 4-hour bad-weather block is forecast, time a 60-minute sleep break inside it. You lose less by resting in the storm than by riding through it." },
    ],
  },
  {
    slug: "time-stations",
    title: "Time stations + the GPX route",
    group: "live-ops",
    readMin: 3,
    blurb:
      "54 time stations + section flags + the canonical GPX file.",
    blocks: [
      { kind: "p", text:
          "RAAM 2026 has 54 time stations. Each one is on the live map with a colored ring showing the section's rule constraint." },
      { kind: "h", text: "Section flag colors" },
      { kind: "kv", rows: [
          { k: "Red",    v: "Racers only (Oceanside parade start)." },
          { k: "Orange", v: "No aux vehicles (TS6→9 Skull Valley fallback)." },
          { k: "Purple", v: "Shuttle zone (Sedona, Delaware Memorial Bridge)." },
          { k: "Blue",   v: "Mandatory direct follow (TS10→13 Navajo Nation)." },
          { k: "Yellow", v: "Leapfrog daytime only." },
          { k: "Cyan",   v: "Time-zone change (TS10, TS23, TS38)." },
          { k: "Slate",  v: "Altitude pass (Wolf Creek, La Veta, Cuchara)." },
          { k: "Gray",   v: "Long stretch with no services." },
        ] },
      { kind: "callout", tone: "warn", title: "TS6→TS9 (~150 mi)", text:
          "Aux vehicle must take alternate route. Pre-stage fallback parking points. If Follow has a mechanical, Aux has to be reachable inside 30 minutes — plan accordingly." },
    ],
  },
  {
    slug: "bikes",
    title: "Bikes + tool catalog",
    group: "data",
    readMin: 3,
    blurb:
      "Four bikes, all Shimano Dura-Ace Di2 R9200. Manuals one tap away.",
    blocks: [
      { kind: "p", text:
          "Open /bikes for the full fleet view. Each bike has a use-case so the crew knows which one to hand off when." },
      { kind: "kv", rows: [
          { k: "Addict (matte black)", v: "Climbs + rolling endurance" },
          { k: "Foil RC (white/silver)", v: "Aero flats — Kansas, Indiana, NJ run-in" },
          { k: "Foil RC (blue)", v: "Backup aero, identical spec" },
          { k: "Plasma TT (teal/purple)", v: "TT aero — restricted handlers (Joby, Varun, Vishal, Satish)" },
        ] },
      { kind: "callout", tone: "danger", title: "Carbon wheels", text:
          "Only crew with the verified handler skill should mount, dismount, or change tires. See the Crew skill matrix when it ships." },
      { kind: "h", text: "Manuals" },
      { kind: "ul", items: [
          "Per-bike Scott manual — open from the bike card on /bikes.",
          "Shimano Di2 dealer manual — shared across all bikes, in the Shared manuals section.",
          "Pair with the Shimano E-TUBE Project Cyclist app for shift-mode tuning.",
        ] },
    ],
  },
  {
    slug: "comms",
    title: "Comms — WhatsApp + Discord",
    group: "live-ops",
    readMin: 3,
    blurb:
      "Main WhatsApp group is the source of truth. Discord is for RAAM officials.",
    blocks: [
      { kind: "p", text:
          "Three WhatsApp groups: Main (chief + on-duty leads), Shift-1, Shift-2. The app syncs only with Main — shift groups stay informal." },
      { kind: "kv", rows: [
          { k: "Main", v: "Two-way sync with /comms timeline. Anything posted here logs in the app." },
          { k: "Shift-1 / Shift-2", v: "No app sync. Crew banter. Read-only mirror is fine." },
          { k: "Discord", v: "Official RAAM channels only — race control, mandatory updates." },
        ] },
      { kind: "callout", tone: "warn", title: "Don't lose the walkie", text:
          "Walkies live in pockets, never on the car roof. The auxiliary vehicle does a perimeter check before any departure (helmet, vest, sling bag, walkie)." },
    ],
  },
  {
    slug: "settings",
    title: "Settings — units, theme, account",
    group: "lifecycle",
    readMin: 2,
    blurb:
      "How to switch units, change theme, sign out.",
    blocks: [
      { kind: "h", text: "Units" },
      { kind: "p", text:
          "Avatar menu → Units. Toggle imperial (mi, °F) ↔ metric (km, °C). The whole app converts at display time. RAAM data + GPX stay in imperial under the hood." },
      { kind: "h", text: "Theme" },
      { kind: "p", text:
          "Top bar moon/sun icon. Dark by default, with auto night mode 19:00–07:00 that deepens contrast for in-car readability." },
      { kind: "h", text: "Sign out / switch team" },
      { kind: "p", text:
          "Avatar menu shows your team. If you belong to more than one, switch from there. Sign out clears the session." },
    ],
  },
  {
    slug: "sos",
    title: "Emergency / SOS",
    group: "lifecycle",
    readMin: 2,
    blurb:
      "Red button at the top. What it does, when to use it.",
    blocks: [
      { kind: "callout", tone: "danger", title: "Use only for actual emergencies", text:
          "Crash, medical event, lost rider. Not for flat tires or wrong turns — those are stop requests." },
      { kind: "p", text:
          "The SOS button is in the top bar (red). Tapping it:" },
      { kind: "ol", items: [
          "Records who pressed it + their last GPS",
          "Inserts a CRITICAL alert in the timeline",
          "Mirrors to Discord (RAAM HQ visible) and to the comms log",
          "Opens a confirm-or-cancel modal — you have 5 seconds to back out",
        ] },
      { kind: "p", text:
          "After firing, the chief follows the SOS SOP: dial 911 (US) or local emergency, mark rider position, set up safe zone, log resolution in the alert when done." },
    ],
  },
  {
    slug: "glossary",
    title: "Glossary",
    group: "reference",
    readMin: 2,
    blurb: "Acronyms and shorthand.",
    blocks: [
      { kind: "kv", rows: [
          { k: "TS",    v: "Time Station — official mile marker, 0 to 54." },
          { k: "RAW",   v: "Race Across the West — first 940 miles of RAAM." },
          { k: "Aux",   v: "Auxiliary support vehicle — secondary to Follow." },
          { k: "Leapfrog", v: "Vehicle jumps ahead, sets up handoff, then follow vehicle catches up." },
          { k: "Direct follow", v: "Vehicle drives behind rider continuously, day + night." },
          { k: "Five-foot rule", v: "Vehicle must be at least 5 feet right of fog line when stopped." },
          { k: "Cutoff", v: "288-hour finish deadline for Solo Men Under 50." },
          { k: "EDT",   v: "Eastern Daylight Time — official RAAM clock." },
          { k: "Five-foot rule", v: "Min lateral clearance when crew vehicle stops on the shoulder." },
          { k: "GEAR Book", v: "RAAM's official rule + route document, published yearly." },
          { k: "Di2",   v: "Shimano electronic shifting on all bikes." },
        ] },
    ],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    group: "reference",
    readMin: 4,
    blurb: "Things that go wrong + the fix.",
    blocks: [
      { kind: "h", text: "I can't see any data" },
      { kind: "p", text:
          "Pre-race, most screens are empty by design — they fill in once GPS pings + log entries start. If you're mid-race and screens are blank: log out, log in, check Supabase status with the chief." },
      { kind: "h", text: "Vehicle pings stopped" },
      { kind: "p", text:
          "Phone went to sleep, permission revoked, or signal dropped. Open /track/<id> on the on-duty crew phone, re-grant location, tap Start." },
      { kind: "h", text: "Wrong units" },
      { kind: "p", text:
          "Avatar → Units → Switch. Affects the whole app instantly." },
      { kind: "h", text: "Can't sign in" },
      { kind: "p", text:
          "Magic-link expires after 1 hour. Request a new one from /login. If still stuck, ask the chief to re-issue your invite." },
      { kind: "h", text: "Stop request stuck on pending" },
      { kind: "p", text:
          "The countdown shows 'ready' once the 15 min are up — that's the cue for the crew to actually pull over. Tap → on the row to mark dispatched. If the rider declined, tap × to cancel." },
    ],
  },
];

export function getArticle(slug: string): HelpArticle | null {
  return HELP_ARTICLES.find((a) => a.slug === slug) ?? null;
}
