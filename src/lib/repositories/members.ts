import type { Group, GroupMember } from "@/types/group";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getGroupMembers as getMockGroupMembers,
  getDriverGroups as getMockDriverGroups,
} from "@/lib/mock-data";
import { mapGroupsRow, mapGroupMemberRow } from "@/lib/repositories/mappers";

/**
 * Members / group-membership repository — mock fallback.
 *
 * DB path fetches the canonical group_members join (teamId resolved via
 * team_members scoped to the group) and maps to the domain GroupMember.
 * Returns empty arrays in DB mode when the caller has no memberships
 * (RLS denies non-members of a group from reading its membership).
 */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockGroupMembers(groupId);

  // Fetch membership rows (RLS: only visible when caller is a member of the
  // group, or the caller's group_role is not null).
  const { data: gmRows } = await client
    .from("group_members")
    .select("*")
    .eq("group_id", groupId);

  if (!gmRows || gmRows.length === 0) return [];

  // Resolve each member's teamId within this group via team_members + teams.
  // Two small in-flight queries: team ids in this group, then team membership.
  const { data: teamRows } = await client
    .from("teams")
    .select("id")
    .eq("group_id", groupId);

  const teamIds = (teamRows ?? []).map((t) => t.id);
  const driverToTeam = new Map<string, string>();

  if (teamIds.length > 0) {
    const { data: tmRows } = await client
      .from("team_members")
      .select("team_id, driver_id")
      .in("team_id", teamIds);

    for (const row of tmRows ?? []) {
      driverToTeam.set(row.driver_id, row.team_id);
    }
  }

  return gmRows.map((row) =>
    mapGroupMemberRow(row, driverToTeam.get(row.driver_id) ?? null),
  );
}

/**
 * Fetches all groups where the given driver is a member. Returns the
 * domain Group object with derived previews set to their neutral defaults
 * (upcomingRace: null, recentResults: [], currentChampionship: null).
 */
export async function getDriverGroups(driverId: string): Promise<Group[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockDriverGroups(driverId);

  const { data: gmRows } = await client
    .from("group_members")
    .select("group_id")
    .eq("driver_id", driverId);

  const groupIds = (gmRows ?? []).map((r) => r.group_id);
  if (groupIds.length === 0) return [];

  const { data: groupRows } = await client
    .from("groups")
    .select("*")
    .in("id", groupIds);

  return (groupRows ?? []).map(mapGroupsRow);
}