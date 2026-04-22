/**
 * Whoop API v2 client — OAuth + recovery/sleep pulls.
 *
 * Whoop developer docs: https://developer.whoop.com/api/
 * Scopes needed: read:recovery read:sleep read:cycles read:profile offline
 *
 * Env:
 *   WHOOP_CLIENT_ID        — from https://developer.whoop.com apps
 *   WHOOP_CLIENT_SECRET    — same
 *   WHOOP_REDIRECT_URI     — e.g. https://raam-2026.vercel.app/api/whoop/callback
 */

const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const WHOOP_API = "https://api.prod.whoop.com/developer";

export const WHOOP_SCOPES = [
  "read:recovery",
  "read:sleep",
  "read:cycles",
  "read:profile",
  "offline",
].join(" ");

export interface WhoopTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  scope: string;
  token_type: "bearer";
}

export interface WhoopProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: "SCORED" | "PENDING_SCORE" | "UNSCORABLE";
  score?: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  };
}

export interface WhoopSleep {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: string;
  score?: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  };
}

function requireEnv(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`${k} not configured`);
  return v;
}

/** Build the consent URL the user must visit to authorize the app. */
export function buildAuthorizeUrl(state: string): string {
  const clientId = requireEnv("WHOOP_CLIENT_ID");
  const redirect = requireEnv("WHOOP_REDIRECT_URI");
  const u = new URL(WHOOP_AUTH_URL);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirect);
  u.searchParams.set("scope", WHOOP_SCOPES);
  u.searchParams.set("state", state);
  return u.toString();
}

/** Exchange the ?code returned to redirect_uri for access+refresh tokens. */
export async function exchangeCode(code: string): Promise<WhoopTokens> {
  const clientId = requireEnv("WHOOP_CLIENT_ID");
  const clientSecret = requireEnv("WHOOP_CLIENT_SECRET");
  const redirect = requireEnv("WHOOP_REDIRECT_URI");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirect,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`whoop token exchange ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as WhoopTokens;
}

/** Refresh an expired access token. */
export async function refreshToken(refresh: string): Promise<WhoopTokens> {
  const clientId = requireEnv("WHOOP_CLIENT_ID");
  const clientSecret = requireEnv("WHOOP_CLIENT_SECRET");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh,
    client_id: clientId,
    client_secret: clientSecret,
    scope: WHOOP_SCOPES,
  });
  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`whoop refresh ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as WhoopTokens;
}

async function authedFetch(
  access: string,
  path: string,
  qs: Record<string, string> = {},
): Promise<unknown> {
  const u = new URL(`${WHOOP_API}${path}`);
  for (const [k, v] of Object.entries(qs)) u.searchParams.set(k, v);
  const res = await fetch(u.toString(), {
    headers: { authorization: `Bearer ${access}` },
  });
  if (!res.ok) {
    throw new Error(`whoop ${path} ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function fetchProfile(access: string): Promise<WhoopProfile> {
  return authedFetch(access, "/v2/user/profile/basic") as Promise<WhoopProfile>;
}

export async function fetchRecovery(
  access: string,
  sinceIso: string,
): Promise<WhoopRecovery[]> {
  const body = (await authedFetch(access, "/v2/recovery", {
    start: sinceIso,
    limit: "25",
  })) as { records: WhoopRecovery[] };
  return body.records ?? [];
}

export async function fetchSleep(
  access: string,
  sinceIso: string,
): Promise<WhoopSleep[]> {
  const body = (await authedFetch(access, "/v2/activity/sleep", {
    start: sinceIso,
    limit: "25",
  })) as { records: WhoopSleep[] };
  return body.records ?? [];
}
