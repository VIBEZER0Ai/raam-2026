# RAAM 2026 — Command & Control Center

Race Across America 2026 operations platform for **Team Kabir** (Coach Kabir Rachure, Solo Men Under 50, Racer #610, 3rd RAAM attempt).

> *"Keep the rider safe, fed, on route, on schedule. Keep the team calm."*

**Start:** Tuesday, June 16, 2026 — 12:00 PDT (Oceanside, CA)
**Hard cutoff:** Monday, June 29, 2026 — 15:00 EDT (Atlantic City, NJ)
**Course:** 3,068 mi · 54 Time Stations · 13 states · 170,000 ft climb · 4 time zones
**Division cutoff:** 288 hours (12 days) — Solo Men Under 50

## Stack

- Next.js 16 App Router + React 19 + TypeScript + Tailwind 4
- Supabase (Postgres, Realtime, Auth)
- Mapbox GL (GPX + live tracking)
- Vercel (PWA hosting)

## Modules

1. War Room Dashboard — countdown, pace, next TS
2. Time Station Tracker — 2023 baseline vs 2026 actual
3. Rider Vitals — Strava/Garmin/Whoop
4. Nutrition Log — carbs/water/sodium deficit
5. Rest/Sleep — Whoop recovery, Shermer's risk
6. Crew Shifts — 10 crew, 3 vehicles
7. Route Map — GPX + elevation + position
8. Weather Strip — route-segment forecast
9. Bike Shops — Scott/Di2/carbon, tiered, one-tap call+map
10. Rule Compliance Engine — auto-checks 2026 RAAM rules
11. Penalty Tracker — DQ risk (5 penalties = DQ)
12. GPS Tracker Monitor — 60min silence alert
13. Discord Panel — official HQ comms mirror
14. Social Poster — IG + FB queue
15. SOS / Emergency — hospital + bike-shop locator

## Crew

- **Crew Chief:** Sapna (Kabir's sister)
- **C&C Operator:** Vishal Behal
- 8 more across follow / shuttle / RV / media

## Setup

```bash
pnpm install
cp .env.local.example .env.local
# Fill Supabase + Mapbox + Weather keys
pnpm dev
```

## Database

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Deploy

```bash
vercel
```

## License

Private project for Team Kabir.
