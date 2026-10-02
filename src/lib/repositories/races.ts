import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Race, RaceDriver, RaceEvent, RacePenalty } from "@/types/race";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getRaceById as getMockRaceById,
  getRacesByGroupId as getMockRacesByGroupId,
  getRacesForUser as getMockRacesForUser,
  getRaceDrivers as getMockRaceDrivers,
  getRacePenalties as getMockRacePenalties,
  getRaceEvents as getMockRaceEvents,
} from "@/lib/mock-data";
import {
  mapRaceRow,
  mapRaceDriverRow,
  mapRacePenaltyRow,
  mapRaceEventRow,
} from "@/lib/repositories/mappers";

/** Ranks completed races earliest last (same comparator as the mock helper). */
function sortRaceRows(rows: Race[]): Race[] {
  return [...rows].sort(
    (a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime),
  );
}

async function fetchEntriesByRace(
  client: SupabaseClient<Database>,
  raceIds: string[],
): Promise<Map<string, RaceDriver[]>> {
  const byRace = new Map<string, RaceDriver[]>();
  if (raceIds.length === 0) return byRace;

  const { data: rows } = await client.from("race_entries").select("*").in("race_id", raceIds);
  for (const row of rows ?? []) {
    const list = byRace.get(row.race_id) ?? [];
    list.push(mapRaceDriverRow(row));
    byRace.set(row.race_id, list);
  }
  return byRace;
}

/**
 * Race repository — mock fallback.
 *
 * participatingDriverIds is derived from race_entries (Step 1 decision), so
 * every DB path that builds the domain Race object also resolves entries.
 */
export async function getRaceById(id: string): Promise<Race | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockRaceById(id) ?? null;

  const { data: row, error } = await client.from("races").select("*").eq("id", id).maybeSingle();
  if (error || !row) return null;

  const entries = await fetchEntriesByRace(client, [id]);
  const participatingDriverIds = (entries.get(id) ?? []).map((e) => e.driverId);
  return mapRaceRow(row, participatingDriverIds);
}

export async function getRacesByGroupId(groupId: string): Promise<Race[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockRacesByGroupId(groupId);

  const { data: rows } = await client.from("races").select("*").eq("group_id", groupId);
  if (!rows || rows.length === 0) return [];

  const byRace = await fetchEntriesByRace(client, rows.map((r) => r.id));
  return rows.map((row) =>
    mapRaceRow(row, (byRace.get(row.id) ?? []).map((e) => e.driverId)),
  );
}

export async function getRacesForUser(driverId: string): Promise<Race[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockRacesForUser(driverId);

  const { data: gmRows } = await client
    .from("group_members")
    .select("group_id")
    .eq("driver_id", driverId);

  const groupIds = (gmRows ?? []).map((r) => r.group_id);
  if (groupIds.length === 0) return [];

  const { data: rows } = await client.from("races").select("*").in("group_id", groupIds);
  if (!rows || rows.length === 0) return [];

  const byRace = await fetchEntriesByRace(client, rows.map((r) => r.id));
  return sortRaceRows(
    rows.map((row) =>
      mapRaceRow(row, (byRace.get(row.id) ?? []).map((e) => e.driverId)),
    ),
  );
}

export async function getRaceDrivers(raceId: string): Promise<RaceDriver[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockRaceDrivers(raceId);

  const { data: rows } = await client.from("race_entries").select("*").eq("race_id", raceId);
  return (rows ?? []).map(mapRaceDriverRow);
}

export async function getRacePenalties(raceId: string): Promise<RacePenalty[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockRacePenalties(raceId);

  const { data: rows } = await client.from("race_penalties").select("*").eq("race_id", raceId);
  return (rows ?? []).map(mapRacePenaltyRow);
}

export async function getRaceEvents(raceId: string): Promise<RaceEvent[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockRaceEvents(raceId);

  const { data: rows } = await client.from("race_events").select("*").eq("race_id", raceId);
  return (rows ?? []).map(mapRaceEventRow);
}