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
- ⏳ AA5.2 FooterBar: real derived state (requires pulling in layout)
- ⏳ AA5.3 War Room: real ALERTS from rule_evaluation
- ⏳ AA5.4 Crew screen: real shift data (new `crew_shift` rows)
- ⏳ AA5.5 Time Stations: ETA calc from derived.currentSpeed + coord remap
- ⏳ AA5.6 Nutrition: history filter (today / 3h / entries)
- ⏳ AA5.7 Weather: Open-Meteo wire for rider coord
- ⏳ AA5.8 Compliance: merge rule_evaluation + penalty table
- ⏳ AA5.9 Comms: compose → Discord webhook outbound
- ⏳ AA5.10 Sleep: Whoop sleep overlay on rest_log
- ⏳ AA5.11 Pre-race: editable checklist per team
- ⏳ AA5.12 Spectator: team-branded header copy
- ⏳ AA5.13 Admin overview: real counts (crew N, rules N, evals N)

---

## Review cadence

- **Before each coding session** — review Wave AA board, pick next P0/P1
- **End of each session** — update state columns, move completed rows into archived wave below
- **Weekly (Sun)** — triage new items from on-the-water feedback

---

## Archived

_(moved here once AA items ship)_
