# RAAM 2026 — Route Reference

Source documents (kept on Vishal's Desktop, not in repo):
- `2026_RAAM_Route_Book_FINAL.pdf` — 55 pages, 54 time stations
- `RAAM_2026.gpx` — RidewithGPS route 54768164, 47742 trkpts

Repo artifacts:
- `public/raam/raam-2026.gpx` — verbatim copy of the GPX
- `public/raam/route.geojson` — RDP-simplified polyline (1415 pts, 30 KB) for map rendering
- `public/raam/ts-waypoints.json` — 55 inferred TS coords (max drift 5.9 mi at finish)
- `src/lib/raam/time-stations-2026.ts` — canonical TS list with section flags

## Race summary

- Start: Oceanside Harbor, CA · 33.194456, -117.384258
- Finish: Atlantic City Boardwalk, NJ · 39.353848, -74.43775
- Total distance: 3068.2 miles
- Time stations: 54 (TS0 start → TS53 racing-ends → TS54 parade finish)
- Highest point: Wolf Creek Pass CO 10856 ft (TS17 segment)
- Lowest point: ~194 ft below sea level (TS1→TS2 between Brawley and Salton Sea)

## Key constraints by zone

| TS range | Constraint |
|---|---|
| Start → TS0 mi 22.4 | Racers only · no support vehicles anywhere |
| TS0 mi 22.5 → TS3 | Leapfrog daytime · 5-foot rule |
| TS3 → TS9 mi 64.7 | No direct-follow during AZ daytime |
| **TS6 → TS9** (~150 mi) | **Aux + RV must take alternate** · only follow vehicle on race route |
| TS8 → TS9 (Sedona shuttle) | Mile 16.0–36.5: bike loaded into follow vehicle |
| TS9 mi 41.8 | Navajo Nation: clocks +1 hr (RAAM time = local −2 hr) |
| TS9 mi 64.7 → TS22 | Mandatory direct follow day + night |
| TS22 mi 14.3 | Kansas: clocks → CDT (RAAM time −1 hr) |
| TS37 → TS38 mi 60.0 | Indiana: clocks → EDT (= RAAM time) |
| TS51 → TS52 mi 41.4–45.9 | Delaware Memorial Bridge shuttle |
| TS53 → TS54 | Boardwalk parade · 2 vehicles only |

## Sleep-hotel decision points

(Rough; refine with weather + actual pace.)
- After TS3 Blythe, before AZ heat
- After TS9 Flagstaff, before Navajo Nation no-services run
- After TS17 South Fork, before Wolf Creek climb
- After TS25 Greensburg, mid-Kansas
- After TS33 Jefferson City, mid-MO
- After TS44 Athens, before WV/MD climbs
- After TS50 Rouzerville, final push

## Live-ops time references

- **Race time = Eastern Daylight Time** for all reporting
- Two stopwatches running entire race (elapsed-hour tracker), single source of truth in `race_event` table per AA6.2
- Add NY clock to all crew phones

## Files Sapna and crew should always have offline

1. Route book PDF (paper backup in each vehicle)
2. GPX file loaded in **GPX Viewer** (Android + iOS, free)
3. RAAM live tracker bookmark
4. Discord (RAAM officials channel only)
5. WhatsApp main group (synced to app per AA6.11)

## Critical apps (per call 2026-04-27)

- **Windy** — weather + wind direction (Kabir has premium)
- **GPX Viewer** — turn-by-turn nav fallback
- **Shimano Di2 connectivity** — gear tuning
- **SRAM AXS** — Addict bike only
- **WhatsApp** — primary crew comms
- **Discord** — RAAM officials only
