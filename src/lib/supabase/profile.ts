import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Driver } from "@/types/driver";
import { getDriverById, CURRENT_USER_ID } from "@/lib/mock-data";

const EMPTY_STATS: Driver["stats"] = {
  totalRaces: 0,
  wins: 0,
  podiums: 0,
  poles: 0,
  fastestLaps: 0,
  bestLap: null,
  avgQualifying: null,
  dnfs: 0,
  penalties: 0,
  penaltySeconds: 0,
  cleanRaces: 0,
  winStreak: 0,
  podiumStreak: 0,
};

/**
 * Resolves the current authenticated user's driver profile from
 * auth.users -> profiles -> drivers.
 *
 * When Supabase is not configured (no env), or the session has no user, or
 * the user has no drivers row yet, it falls back to the mock current driver
 * so existing pages never depend on a live project.
 *
 * Derived aggregates (stats, badges, recentForm) are computed by the
 * application layer and are NOT stored (see docs/phase-5-step-1.md). The DB
 * mapper returns neutral defaults for them.
 */
export async function getCurrentDriverProfile(): Promise<Driver | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getDriverById(CURRENT_USER_ID) ?? null;

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return getDriverById(CURRENT_USER_ID) ?? null;

  const { data: row, error } = await client
    .from("drivers")
    .select("id, nickname, racing_number, avatar_color, avatar_text_color, rating, profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error || !row) return getDriverById(CURRENT_USER_ID) ?? null;

  const { data: profile } = await client
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: row.id,
    name: profile?.full_name ?? "",
    nickname: row.nickname ?? "",
    racingNumber: row.racing_number ?? 0,
    avatarColor: row.avatar_color,
    avatarTextColor: row.avatar_text_color,
    rating: row.rating,
    stats: EMPTY_STATS,
    badges: [],
    recentForm: [],
    teamId: null,
  };
}