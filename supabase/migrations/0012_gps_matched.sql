-- Add snapped-to-road columns for gps_ping.
-- matched_lat/lng are Mapbox Map Matching output; null = not yet snapped or unmatchable.
-- match_confidence is Mapbox's 0-1 score.

alter table gps_ping
  add column if not exists matched_lat numeric(10,7),
  add column if not exists matched_lng numeric(10,7),
  add column if not exists match_confidence numeric(4,3);

create index if not exists idx_gps_ping_matched on gps_ping(matched_lat, matched_lng)
  where matched_lat is not null;
