import type { Team } from "@/types/team";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getTeamsByGroup as getMockTeamsByGroup,
  getTeamById as getMockTeamById,
  getTeamMembers as getMockTeamMembers,
  mockTeams as getMockTeams,
} from "@/lib/mock-data";
import type { Driver } from "@/types/driver";
import { mapTeamRow } from "@/lib/repositories/mappers";
import { fetchDriversByIds } from "@/lib/repositories/data";

/**
 * Team repository — mock fallback.
 *
 * memberIds are derived from team_members (not stored on teams itself,
 * see Step 1 schema comment) so every public function that builds the
 * domain Team object also resolves membership.
 */
export async function getTeamsByGroup(groupId: string): Promise<Team[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockTeamsByGroup(groupId);

  const { data: teamRows } = await client
    .from("teams")
    .select("*")
    .eq("group_id", groupId);

  if (!teamRows || teamRows.length === 0) return [];

  const teamIds = teamRows.map((t) => t.id);
  const { data: tmRows } = await client
    .from("team_members")
    .select("team_id, driver_id")
    .in("team_id", teamIds);

  const memberIdsByTeam = new Map<string, string[]>();
  for (const row of tmRows ?? []) {
    const arr = memberIdsByTeam.get(row.team_id) ?? [];
    arr.push(row.driver_id);
    memberIdsByTeam.set(row.team_id, arr);
  }

  return teamRows.map((row) => mapTeamRow(row, memberIdsByTeam.get(row.id) ?? []));
}

export async function getTeamById(id: string): Promise<Team | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockTeamById(id) ?? null;

  const { data: row, error } = await client.from("teams").select("*").eq("id", id).maybeSingle();
  if (error || !row) return null;

  const { data: tmRows } = await client
    .from("team_members")
    .select("driver_id")
    .eq("team_id", id);

  const memberIds = (tmRows ?? []).map((r) => r.driver_id);
  return mapTeamRow(row, memberIds);
}

/**
 * Resolves all drivers assigned to a given team. Used by the championship
 * team standings cards.
 */
export async function getTeamMembers(teamId: string): Promise<Driver[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockTeamMembers(teamId);

  const { data: tmRows } = await client
    .from("team_members")
    .select("driver_id")
    .eq("team_id", teamId);

  const ids = (tmRows ?? []).map((r) => r.driver_id);
  return fetchDriversByIds(client, ids);
}

/**
 * Resolves several teams by id, preserving caller order. Used by the
 * championship pages so a DB-backed season can render team identities
 * without per-team trips.
 */
export async function getTeamsByIds(ids: string[]): Promise<Team[]> {
  const client = await createServerSupabaseClient();
  if (!client) return ids.map((id) => getMockTeamById(id)).filter((t): t is Team => Boolean(t));

  if (ids.length === 0) return [];
  const { data: teamRows } = await client.from("teams").select("*").in("id", ids);
  if (!teamRows || teamRows.length === 0) return [];

  const teamIds = teamRows.map((t) => t.id);
  const { data: tmRows } = await client
    .from("team_members")
    .select("team_id, driver_id")
    .in("team_id", teamIds);

  const memberIdsByTeam = new Map<string, string[]>();
  for (const row of tmRows ?? []) {
    const arr = memberIdsByTeam.get(row.team_id) ?? [];
    arr.push(row.driver_id);
    memberIdsByTeam.set(row.team_id, arr);
  }

  const byId = new Map(teamRows.map((row) => [row.id, mapTeamRow(row, memberIdsByTeam.get(row.id) ?? [])]));
  return ids.flatMap((id) => {
    const team = byId.get(id);
    return team ? [team] : [];
  });
}

/**
 * Returns the team id that a driver belongs to, or null. The DB path only
 * considers teams within the current group (or any group, if group context
 * is unavailable); this is intentionally a thin lookup.
 */
export async function teamByDriver(driverId: string): Promise<string | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockTeams.find((t) => t.memberIds.includes(driverId))?.id ?? null;

  const { data } = await client
    .from("team_members")
    .select("team_id")
    .eq("driver_id", driverId)
    .maybeSingle();

  return data?.team_id ?? null;
}