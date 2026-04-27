# Ventor · Sprint Board

Living doc. Three columns per item: **Done** · **Good** · **Fix**.
Grouped by wave. Earlier waves were ad-hoc A-Z. Waves AA+ are structured.

Legend:
- ✅ Done — shipped + working
- ⚠️ Good — shipped but rough
- 🔧 Fix — broken or missing
- ⏳ Queued — not started

Last updated: 2026-04-23

---

## Wave A–Z (initial build, completed)

| Code | Feature | State | Notes |
|---|---|---|---|
| V | Rule-engine cron every 5 min | ✅ | GitHub Actions, Bearer CRON_SECRET |
| W | Nutrition logger → Supabase writes | ✅ | quick-log buttons, hourly+3h rollup |
| Y | RAAM tracker scraper scaffold | ⚠️ | disabled until 2026 URL published |
| N | Role reassignment UI | ✅ | `/admin/roster` |
| M | Contact fields form | ✅ | phone/email/emergency_contact |
| U | Whoop OAuth + cron pull | ✅ | needs user to connect per rider |
| Privacy/Terms | Public pages for Whoop submission | ✅ | `/privacy`, `/terms` |
| Whoop logo | TK · RAAM 26 monogram | ✅ | PNG + SVG on Desktop |
| Z | Custom domain | ✅ | `ventor.fit` live via Vercel NS |
| O | Chief-only RLS | ✅ | `is_crew_chief()` + self-update own row |
| 0017 | Multi-tenancy foundation | ✅ | `team`, `team_member`, `event_template`, team_id FK backfill |
| 0018 | Team-scoped RLS | ✅ | every op table `current_team_ids()` |
| GPX | New RAAM 2026 route | ✅ | 47,742 trkpts → 1,415-pt polyline |
| Ventor brand | top-nav, layout, login | ✅ | VENTOR · Team Kabir |
| Responsive | mobile hamburger + tablet pill-bar + desktop | ⚠️ | works but nav model needs rework |
| Landing page | public marketing at `/` | ✅ | hero, features, footer CTA |
| Theme toggle | dark/light persisted | ✅ | night no longer forces dark when light active |
| Whoop redirect URIs | swapped to ventor.fit | ✅ | raam-2026 kept as fallback |
| Supabase URLs | Site URL + redirect allow-list | ✅ | ventor.fit/** + app.ventor.fit/** |

---

## Wave AA · Productization polish (current sprint)

| ID | Item | State | Priority | Notes |
|---|---|---|---|---|
| AA1 | `/spectator` team-scoped — should be `/spectator/kabir-raam-2026` | 🔧 | P0 | current route is generic, needs team slug |
| AA2 | Supabase magic-link email branding (Ventor) | 🔧 | P0 | currently unbranded default template |
| AA3 | Onboarding walkthrough after signup | ⏳ | P1 | invite crew + connect Whoop + first-GPS tour |
| AA4 | Navigation model redesign | ⏳ | P1 | 12 flat tabs — collapse into groups |
| AA5 | Per-screen UX audit pass | ⏳ | P1 | War Room → Crew → Nutrition → Sleep → Comms → Compliance → Weather → Admin |
| AA6 | Spectator tile theme (for race-day public) | ⏳ | P2 | dark-optimized, live-map centric |
| AA7 | Team switcher in top-nav | ⏳ | P2 | multi-team later |
| AA8 | Billing stubs → Stripe wiring | ⏳ | P3 | post-RAAM |

## Wave AB · Content + data

| ID | Item | State | Priority | Notes |
|---|---|---|---|---|
| AB1 | Time-station coord map-match against new GPX | ⏳ | P1 | 53 TS need mile_from_start recompute |
| AB2 | Crew seed — missing members (Kabir rider email, Sapana Whoop) | ⏳ | P2 | |
| AB3 | Rule thresholds review with Sapana | ⏳ | P1 | |
| AB4 | 2023 historical splits import for benchmarks | ⚠️ | P2 | some rows present, incomplete |

## Wave AC · Operational hardening

| ID | Item | State | Priority | Notes |
|---|---|---|---|---|
| AC1 | Vercel Pro upgrade (real cron, higher limits) | ⏳ | P2 | GitHub Actions fallback in place |
| AC2 | Error tracking (Sentry or similar) | ⏳ | P1 | silent failures in prod |
| AC3 | Analytics (privacy-first, Plausible) | ⏳ | P3 | |
| AC4 | Team invitation email flow | ⏳ | P1 | signup wizard has no invite step yet |
| AC5 | Row-count + storage metrics dashboard | ⏳ | P3 | |
| AC6 | Backup strategy — Supabase nightly export | ⏳ | P1 | |

---

## Per-screen audit (AA5 detail)

Revisit 2026-04-23 — added mock-data usage column. 7 screens still
consume `src/lib/raam/mock-data.ts` (ALERTS, RACE_STATE, WEATHER_NOW,
VEHICLES, NUTRITION_LOG, TARGETS). Tracked as AA5.x sub-tasks.

| Screen | State | Top issues | AA5 sub |
|---|---|---|---|
| War Room `/` | ⚠️ | mock ALERTS banner · mock WEATHER · mock vitals. Crew now live ✅ | AA5.1 ✅ / AA5.3 |
| Crew `/crew` | ⚠️ | uses mock CREW for status pills/shifts; no real shift table | AA5.4 |
| Time Stations `/time-stations` | ⚠️ | stale coords vs new GPX · no ETA derived · table only | AA5.5 |
| Nutrition `/nutrition` | ✅ | 12 buttons crowded · no history filter | AA5.6 |
| Weather `/weather` | 🔧 | uses mock WEATHER_NOW + WEATHER_SEGMENTS · no API wired | AA5.7 |
| Compliance `/compliance` | ⚠️ | mixes real rule_evaluation + mock penalties | AA5.8 |
| Comms `/comms` | ⚠️ | Discord log mocked · no outbound compose | AA5.9 |
| Sleep `/sleep` | ⚠️ | logs visible · Whoop sleep overlay absent | AA5.10 |
| Pre-race `/pre-race` | ⚠️ | checklist shown · not editable · not per-team | AA5.11 |
| Spectator `/spectator/:slug` | ✅ | team-scoped (AA1); still uses hardcoded copy | AA5.12 |
| Admin `/admin` | ⚠️ | overview numbers hardcoded | AA5.13 |
| Admin roster `/admin/roster` | ✅ | edit works · no bulk invite (done via onboarding) | — |
| Debrief `/debrief` | ⚠️ | mockup content · post-race, P3 | — |
| Landing `/` (logged out) | ✅ | fresh, feature grid, CTAs | — |
| Signup `/signup` | ✅ | 2-step wizard | — |
| Onboarding `/onboarding` | ✅ | 4-step wizard + crew invites | — |

### AA5 sub-task queue

- ✅ AA5.1 War Room: real crew from DB (shipped)
- ✅ AA5.2 FooterBar + TopNav alert count from DB (shipped)
- ✅ AA5.3 War Room: real ALERTS from rule_evaluation (shipped)
- ⏳ AA5.4 Crew screen: real shift data (new `crew_shift` rows)
- ⏳ AA5.5 Time Stations: ETA calc + coord remap (folds into AA6.7)
- ⏳ AA5.6 Nutrition: history filter (today / 3h / entries)
- ⏳ AA5.7 Weather: Open-Meteo wire for rider coord — bumped P0
- ⏳ AA5.8 Compliance: merge rule_evaluation + penalty table
- ⏳ AA5.9 Comms: compose → Discord webhook outbound (RAAM officials only)
- ⏳ AA5.10 Sleep: Whoop sleep overlay on rest_log
- ⏳ AA5.11 Pre-race: editable checklist per team
- ⏳ AA5.12 Spectator: team-branded header copy
- ⏳ AA5.13 Admin overview: real counts (crew N, rules N, evals N)

---

## Wave AA6 — Crew sync deliverables (2026-04-27)

Output of Kabir + Sapna brainstorm call + 2026 Route Book ingest. Each ticket
has a clear acceptance bar and a source link to the call digest in this repo
(`docs/call-2026-04-27.md` — TBD).

### Foundation (this session)

- ✅ AA6.0 Route ingest
  - Official 2026 GPX in `public/raam/raam-2026.gpx` (4 MB, 47742 trkpts)
  - Polyline regen → `public/raam/route.geojson` (1415 pts, 30 KB)
  - 54 TS waypoints inferred → `public/raam/ts-waypoints.json` (max drift 5.9 mi at finish, <0.2%)
  - Canonical 2026 TS list → `src/lib/raam/time-stations-2026.ts` with section-flag taxonomy
    (`racers-only`, `no-aux-vehicles`, `no-rvs`, `leapfrog-daytime`,
    `direct-follow-mandatory`, `shuttle-zone`, `tz-change`, `altitude-pass`, `no-services`)
  - 2026 differs from 2023 baseline: total 3068.2 mi (was 2935), eastern half rerouted
    Annapolis MD → Atlantic City NJ via Darlington MD + Malaga NJ
  - Two shuttle zones flagged: TS9 Sedona, TS52 Delaware Memorial Bridge
  - Three time-zone changes flagged: TS10 Navajo Nation (MDT), TS23 Kansas (CDT), TS38 Indiana (EDT/RAAM time)

### Live ops tickets

- ⏳ AA6.1 Stop-request workflow
  - Crew submits stop reason + ETA (`loo`, `food`, `mech`, `other`)
  - 15-min countdown shown on Kabir's surface
  - Acknowledge button (Kabir) → marks `rider_acknowledged` in timeline
  - Mech-flat fast-path: zero-countdown immediate stop
  - Rider surface: open spike → Garmin Connect IQ data field vs voice prompt over crew BT
- ⏳ AA6.2 Race elapsed timer
  - Single source of truth, race-start anchored, Eastern Daylight Time locked
  - Immune to crossing Mountain/Central/Eastern boundaries during race
  - Display: `Day Xd Yh Zm` and `Elapsed Hh Mm`
  - DB: `race_event` table with `start_time_edt`, `state` (pre|live|finished)
- ⏳ AA6.3 Vehicle-separation monitor
  - Track `follow_vehicle` + `aux_vehicle` GPS pings
  - Alert when distance > 30 min apart at current speed (red banner)
  - Aux-fallback section TS6→TS9 special rule: aux must pre-position at flagged park points
- ⏳ AA6.4 Bike + tool catalog
  - Photos + canonical name + torque spec + manual link
  - Searchable, scrollable list, mobile-first
  - Source: Joby's bike photos + Kabir's manuals
- ⏳ AA6.5 Crew skill matrix
  - Per crew member × skill grid (`front-wheel-mount`, `tubeless-patch`, `di2-tune`, `tire-change`, `nav-gpx`)
  - Self-attested ✓ + verified-by-Kabir ✓
  - Drives stop-request routing (only verified crew dispatched for that fix)
- ⏳ AA6.6 Competitor leaderboard
  - Pull from RAAM live tracker
  - Filter by **age category** (Kabir's group only)
  - Position delta vs Kabir's split projection
- ⏳ AA6.7 GPX-driven route view (folds AA5.5)
  - Render `route.geojson` + `ts-waypoints.json` on Mapbox
  - Section-rule badges per leg (no-aux / shuttle / direct-follow)
  - Highlight aux-fallback zones TS6→TS9 in red
  - Time-zone markers at TS10 / TS23 / TS38
  - Shuttle markers at TS9 + TS52
  - ETA per TS using `derived.currentSpeed` + book miles
- ⏳ AA6.8 Bike-shop directory near each TS
  - Geocode shops within 25 mi of each TS coord
  - Cache once, store in `bike_shop` table with phone + open hours
  - Surface in Time Stations panel + Comms quick-call
- ⏳ AA6.9 Vehicle-status screen
  - Live grid: Follow / Leapfrog / Rider · current driver/navigator · GPS coord · last ping
  - GPS source priority: Garmin tracker (recent <5min) → phone GPS → RAAM tracker (rider only)
  - Mobile-first, glanceable from a moving car
- ⏳ AA6.10 Kabir role + access
  - Email: kabirachure@gmail.com
  - Permissions: Co-Chief admin (mirror of Sapna) + Rider read-only stop-request inbound
  - Ack button on rider surface (TBD via AA6.14)
- ⏳ AA6.11 WhatsApp sync (replaces Discord plan)
  - Outbound: Cloud API → main group (number +19056216302)
  - Inbound: webhook on verified domain → app ingest
  - Shifts groups (Shift-1, Shift-2): no app sync, read-only mirror
  - Discord remains: RAAM officials channel only
  - Spike AA6.11a: WhatsApp consumer-group bridge legality (Cloud API does not natively post into consumer groups)
- ⏳ AA6.12 Route book ingest UI
  - Render section rules + cue rows from `time-stations-2026.ts` flags
  - Per-leg detail panel: rules, mile, ETA, weather, bike shops, aux fallback
- ⏳ AA6.13 Shuttle SOP
  - Pre-stage bike rack on follow vehicle
  - Bike load procedure for TS9 Sedona + TS52 Delaware Memorial Bridge
  - Surfaced as a checklist that activates at TS-1 mile threshold
- ⏳ AA6.14 Kabir comm surface (spike)
  - Option A: Garmin Connect IQ data field — count-down + ack tap
  - Option B: voice prompt over crew BT comm — auto-play + verbal ack
  - Decision: pick lowest cognitive load while riding

### Sprint sequencing

P0 next session:
1. AA6.7 (GPX route + TS render) — unlocks visual situational awareness
2. AA6.2 (race elapsed timer) — needed before any ETA work
3. AA5.7 (weather) — Open-Meteo wire, plug into AA6.7 panel

P1 after that:
4. AA6.10 (Kabir role) — small RBAC change
5. AA6.4 (bike + tool catalog) — content-heavy, can run async
6. AA6.9 (vehicle-status screen) — depends on phone GPS PWA shell

---

## Review cadence

- **Before each coding session** — review Wave AA board, pick next P0/P1
- **End of each session** — update state columns, move completed rows into archived wave below
- **Weekly (Sun)** — triage new items from on-the-water feedback

---

## Archived

_(moved here once AA items ship)_
