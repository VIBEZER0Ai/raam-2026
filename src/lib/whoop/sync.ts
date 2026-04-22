/**
 * Pull Whoop data for every crew_member with a stored token,
 * refresh expired access tokens, upsert whoop_recovery + whoop_sleep.
 *
 * Called by:
 *   - /api/cron/whoop-sync   every 30 min (GitHub Actions)
 *   - /api/whoop/callback    immediately after first connect
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchRecovery,
  fetchSleep,
  refreshToken,
  type WhoopRecovery,
  type WhoopSleep,
} from "./client";

export interface SyncSummary {
  tokens_checked: number;
  tokens_refreshed: number;
  recovery_upserted: number;
  sleep_upserted: number;
  errors: { crew_member_id: string; error: string }[];
}

/** Get a valid access token — refresh if within 60s of expiry. */
async function ensureAccess(row: {
  id: string;
  crew_member_id: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string | null;
  whoop_user_id: string;
}): Promise<{ access: string; refreshed: boolean }> {
  const expiresMs = new Date(row.expires_at).getTime();
  if (expiresMs > Date.now() + 60_000) {
    return { access: row.access_token, refreshed: false };
  }
  const fresh = await refreshToken(row.refresh_token);
  const admin = createAdminClient();
  await admin
    .from("whoop_token")
    .update({
      access_token: fresh.access_token,
      refresh_token: fresh.refresh_token,
      expires_at: new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
      scope: fresh.scope,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  return { access: fresh.access_token, refreshed: true };
}

function mapRecovery(crewId: string, r: WhoopRecovery) {
  const s = r.score;
  return {
    crew_member_id: crewId,
    cycle_id: String(r.cycle_id),
    score_state: r.score_state,
    recovery_score: s?.recovery_score ?? null,
    resting_hr: s?.resting_heart_rate ?? null,
    hrv_rmssd_ms: s?.hrv_rmssd_milli ?? null,
    spo2_pct: s?.spo2_percentage ?? null,
    skin_temp_c: s?.skin_temp_celsius ?? null,
    raw: r as unknown,
  };
}

function mapSleep(crewId: string, s: WhoopSleep) {
  const st = s.score?.stage_summary;
  return {
    crew_member_id: crewId,
    sleep_id: String(s.id),
    start_ts: s.start,
    end_ts: s.end,
    nap: s.nap,
    total_sleep_min: st
      ? Math.round(
          (st.total_in_bed_time_milli - st.total_awake_time_milli) / 60000,
        )
      : null,
    rem_sleep_min: st
      ? Math.round(st.total_rem_sleep_time_milli / 60000)
      : null,
    sws_min: st
      ? Math.round(st.total_slow_wave_sleep_time_milli / 60000)
      : null,
    disturbance_count: st?.disturbance_count ?? null,
    sleep_efficiency_pct: s.score?.sleep_efficiency_percentage ?? null,
    respiratory_rate: s.score?.respiratory_rate ?? null,
    raw: s as unknown,
  };
}

export async function runWhoopSync(): Promise<SyncSummary> {
  const admin = createAdminClient();
  const summary: SyncSummary = {
    tokens_checked: 0,
    tokens_refreshed: 0,
    recovery_upserted: 0,
    sleep_upserted: 0,
    errors: [],
  };

  const { data: tokens } = await admin.from("whoop_token").select("*");
  if (!tokens || tokens.length === 0) return summary;

  // Pull last 14 days — covers RAAM race week + taper window.
  const sinceIso = new Date(Date.now() - 14 * 86_400_000).toISOString();

  for (const t of tokens) {
    summary.tokens_checked += 1;
    if (!t.crew_member_id) continue;
    try {
      const { access, refreshed } = await ensureAccess(t);
      if (refreshed) summary.tokens_refreshed += 1;

      const [rec, slp] = await Promise.all([
        fetchRecovery(access, sinceIso),
        fetchSleep(access, sinceIso),
      ]);

      if (rec.length > 0) {
        const rows = rec.map((r) => mapRecovery(t.crew_member_id!, r));
        const { error } = await admin
          .from("whoop_recovery")
          .upsert(rows, { onConflict: "crew_member_id,cycle_id" });
        if (error) throw new Error(`recovery upsert: ${error.message}`);
        summary.recovery_upserted += rows.length;
      }
      if (slp.length > 0) {
        const rows = slp.map((s) => mapSleep(t.crew_member_id!, s));
        const { error } = await admin
          .from("whoop_sleep")
          .upsert(rows, { onConflict: "crew_member_id,sleep_id" });
        if (error) throw new Error(`sleep upsert: ${error.message}`);
        summary.sleep_upserted += rows.length;
      }
    } catch (e) {
      summary.errors.push({
        crew_member_id: t.crew_member_id!,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
  return summary;
}
