/**
 * Mapbox Map Matching — snap noisy GPS traces to road geometry.
 *
 * Docs: https://docs.mapbox.com/api/navigation/map-matching/
 *
 * Free tier: 100k requests/month. One request per inserted ping keeps us
 * well under for a 12-day race. No server-side retry — if Mapbox errors
 * we keep the raw coordinates.
 *
 * Accepts a trace (2-100 points) and returns matched coords aligned with
 * input indices. Missing / unmatchable points come back as null.
 */

export interface MatchInput {
  lng: number;
  lat: number;
  radiusMeters?: number;
}

export interface MatchOutput {
  lng: number;
  lat: number;
  confidence: number;
}

/**
 * Snap a trace to the road network via Mapbox Matching API v5.
 * Returns matched coords for every input point (null where unmatchable).
 *
 * Minimum 2 input points (API requirement). For a single fresh ping,
 * pair it with the previous stored ping.
 */
export async function snapTrace(
  trace: MatchInput[],
  opts: { accessToken?: string; profile?: "driving" | "cycling" } = {},
): Promise<(MatchOutput | null)[] | null> {
  const token =
    opts.accessToken ??
    process.env.MAPBOX_SERVER_TOKEN ??
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.warn("[snapTrace] no Mapbox token in env");
    return null;
  }
  if (trace.length < 2 || trace.length > 100) {
    console.warn("[snapTrace] trace must be 2–100 points, got", trace.length);
    return null;
  }

  const profile = opts.profile ?? "driving";
  const coords = trace.map((p) => `${p.lng},${p.lat}`).join(";");
  const radiuses = trace.map((p) => String(p.radiusMeters ?? 25)).join(";");

  const url =
    `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coords}` +
    `?geometries=geojson&overview=full&tidy=true` +
    `&radiuses=${radiuses}` +
    `&access_token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn("[snapTrace] mapbox error", res.status, body.slice(0, 200));
      return null;
    }
    const json = (await res.json()) as {
      code: string;
      tracepoints?: Array<null | {
        location: [number, number];
        matchings_index: number;
      }>;
      matchings?: Array<{ confidence: number }>;
    };
    if (json.code !== "Ok" || !json.tracepoints) {
      console.warn("[snapTrace] no match", json.code);
      return null;
    }
    return json.tracepoints.map((tp) => {
      if (!tp) return null;
      const confidence =
        json.matchings?.[tp.matchings_index]?.confidence ?? 0;
      return {
        lng: tp.location[0],
        lat: tp.location[1],
        confidence,
      };
    });
  } catch (err) {
    console.warn("[snapTrace] fetch failed", err);
    return null;
  }
}

/**
 * Convenience: snap a single fresh point by pairing with a previous one.
 * Returns matched coords for the fresh point only (the second in the trace).
 */
export async function snapPoint(
  prev: MatchInput,
  fresh: MatchInput,
  opts?: Parameters<typeof snapTrace>[1],
): Promise<MatchOutput | null> {
  const matched = await snapTrace([prev, fresh], opts);
  if (!matched || matched.length < 2) return null;
  return matched[1];
}
