import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Driver } from "@/types/driver";
import type { Group } from "@/types/group";
import type { Team } from "@/types/team";
import type {
  Race,
  RaceDriver,
  RacePenalty,
} from "@/types/race";
import type {
  Award,
  ChampionshipScoring,
  Season,
  SeasonRecord,
  TeamSeasonStats,
} from "@/types/championship";
import {
  computeRaceResultSummary,
  computeStandings,
  computeTeamSeasonStats,
  DEFAULT_CHAMPIONSHIP_SCORING,
  racePoleDriverId,
} from "@/lib/championship-utils";
import type { SeasonRaceResult, SeasonStandingsBundle } from "@/lib/championship-data";
import {
  getSeasonById as getMockSeasonById,
  getActiveSeason as getMockActiveSeason,
  getActiveSeasonForDriver as getMockActiveSeasonForDriver,
  getSeasonRaces as getMockSeasonRaces,
  getSeasonRaceResults as getMockSeasonRaceResults,
  getSeasonStandings as getMockSeasonStandings,
  getSeasonTeamStats as getMockSeasonTeamStats,
  getSeasonAwards as getMockSeasonAwards,
  getSeasonRecords as getMockSeasonRecords,
} from "@/lib/championship-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mapSeasonRow,
  mapRaceRow,
  mapRaceDriverRow,
  mapRacePenaltyRow,
  mapAwardRow,
  mapSeasonRecordRow,
} from "@/lib/repositories/mappers";
import { getGroupById } from "@/lib/repositories/groups";
import { getDriversByIds } from "@/lib/repositories/drivers";
import { getTeamsByIds } from "@/lib/repositories/teams";

interface SeasonData {
  season: Season;
  races: Race[];
  entriesByRace: Record<string, RaceDriver[]>;
  penaltiesByRace: Record<string, RacePenalty[]>;
}

async function loadScoring(client: SupabaseClient<Database>, seasonId: string): Promise<ChampionshipScoring> {
  const { data: sc } = await client
    .from("season_scoring")
    .select("*")
    .eq("season_id", seasonId)
    .maybeSingle();

  if (!sc) return { ...DEFAULT_CHAMPIONSHIP_SCORING };

  const { data: pts } = await client
    .from("scoring_points")
    .select("position, points")
    .eq("season_id", seasonId);

  const pointsByPosition: Record<number, number> = { ...DEFAULT_CHAMPIONSHIP_SCORING.pointsByPosition };
  for (const p of pts ?? []) pointsByPosition[p.position] = p.points;

  return {
    mode: sc.mode,
    pointsByPosition,
    polePositionPoints: sc.pole_position_points,
    fastestLapPoints: sc.fastest_lap_points,
    participationPoints: sc.participation_points,
    dnfPoints: sc.dnf_points,
    dnsPoints: sc.dns_points,
    penaltyAdjustmentEnabled: sc.penalty_adjustment_enabled,
  };
}

async function loadSeason(client: SupabaseClient<Database>, seasonId: string): Promise<Season | null> {
  const { data: row, error } = await client.from("seasons").select("*").eq("id", seasonId).maybeSingle();
  if (error || !row) return null;

  const { data: seasonRaces } = await client
    .from("season_races")
    .select("race_id")
    .eq("season_id", seasonId)
    .order("round_number");

  const raceIds = (seasonRaces ?? []).map((r) => r.race_id);
  const scoring = await loadScoring(client, seasonId);
  return mapSeasonRow(row, raceIds, scoring);
}

async function loadSeasonData(client: SupabaseClient<Database>, seasonId: string): Promise<SeasonData | null> {
  const season = await loadSeason(client, seasonId);
  if (!season) return null;

  const empty: SeasonData = { season, races: [], entriesByRace: {}, penaltiesByRace: {} };
  if (season.raceIds.length === 0) return empty;

  const { data: raceRows } = await client.from("races").select("*").in("id", season.raceIds);
  const raceById = new Map((raceRows ?? []).map((r) => [r.id, r]));
  const races = season.raceIds.flatMap((raceId) => {
    const row = raceById.get(raceId);
    return row ? [mapRaceRow(row, [])] : [];
  });

  const { data: entryRows } = await client.from("race_entries").select("*").in("race_id", season.raceIds);
  const entriesByRace: Record<string, RaceDriver[]> = {};
  for (const row of entryRows ?? []) {
    if (!entriesByRace[row.race_id]) entriesByRace[row.race_id] = [];
    entriesByRace[row.race_id].push(mapRaceDriverRow(row));
  }

  const { data: penaltyRows } = await client.from("race_penalties").select("*").in("race_id", season.raceIds);
  const penaltiesByRace: Record<string, RacePenalty[]> = {};
  for (const row of penaltyRows ?? []) {
    if (!penaltiesByRace[row.race_id]) penaltiesByRace[row.race_id] = [];
    penaltiesByRace[row.race_id].push(mapRacePenaltyRow(row));
  }

  return {
    season,
    races: races.map((race) => ({
      ...race,
      participatingDriverIds: (entriesByRace[race.id] ?? []).map((e) => e.driverId),
    })),
    entriesByRace,
    penaltiesByRace,
  };
}

function computedStandings(data: SeasonData): SeasonStandingsBundle {
  return {
    seasonId: data.season.id,
    ...computeStandings({
      seasonId: data.season.id,
      races: data.races,
      scoring: data.season.scoring,
      getRaceDrivers: (raceId) => data.entriesByRace[raceId] ?? [],
      getPenalties: (raceId) => data.penaltiesByRace[raceId] ?? [],
    }),
  };
}

export interface SeasonIdentityBundle {
  group: Group | null;
  driverById: Map<string, Driver>;
  teamById: Map<string, Team>;
  teamMemberNamesById: Map<string, string[]>;
}

/**
 * View-builder: resolves every identity a championship page renders
 * (drivers, teams, the owning group, team member names) from a single set
 * of driver/team ids. The underlying repositories handle the mock ↔ DB
 * switch internally, so this is direct in both modes: in DB mode it uses
 * the authoritative names, in mock mode it uses the same mock helpers the
 * pages previously imported directly. Missing rows are simply absent from
 * the maps; callers fall back to the neutral "Unknown" label.
 */
export async function resolveSeasonIdentities(
  season: Season,
  driverIds: string[],
  teamIds: string[],
): Promise<SeasonIdentityBundle> {
  const [group, drivers, teams] = await Promise.all([
    getGroupById(season.groupId),
    getDriversByIds([...new Set(driverIds)]),
    getTeamsByIds([...new Set(teamIds)]),
  ]);

  const driverById = new Map(drivers.map((d) => [d.id, d]));
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const memberDriverIds = [...new Set(teams.flatMap((t) => t.memberIds))];
  const memberDrivers = await getDriversByIds(memberDriverIds);
  const memberNameById = new Map(memberDrivers.map((d) => [d.id, d.name]));
  const teamMemberNamesById = new Map(
    teams.map((t) => [t.id, t.memberIds.map((id) => memberNameById.get(id) ?? "").filter((name) => name.length > 0)]),
  );

  return { group, driverById, teamById, teamMemberNamesById };
}

/**
 * Championship repository — mock fallback.
 *
 * Everything the domain Season exposes that references derived data
 * (raceIds, scoring, standings, team stats, race results) is recomputed in
 * the DB path from the persisted normalized rows (seasons, season_races,
 * season_scoring, scoring_points, races, race_entries, race_penalties).
 * Row -> domain mapping and all calculations come from the shared mappers and
 * championship-utils so the DB path and the mock path stay in sync.
 */
export async function getSeasonById(seasonId: string): Promise<Season | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockSeasonById(seasonId) ?? null;
  return loadSeason(client, seasonId);
}

export async function getActiveSeason(groupId: string): Promise<Season | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockActiveSeason(groupId) ?? null;

  const { data: row } = await client
    .from("seasons")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "active")
    .maybeSingle();

  if (!row) return null;
  return loadSeason(client, row.id);
}

export async function getActiveSeasonForDriver(driverId: string): Promise<Season | null> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockActiveSeasonForDriver(driverId) ?? null;

  const { data: gmRows } = await client
    .from("group_members")
    .select("group_id")
    .eq("driver_id", driverId);

  for (const gm of gmRows ?? []) {
    const season = await getActiveSeason(gm.group_id);
    if (season) return season;
  }
  return null;
}

export async function getSeasonRaces(seasonId: string): Promise<Race[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockSeasonRaces(seasonId);

  const data = await loadSeasonData(client, seasonId);
  return data?.races ?? [];
}

export async function getSeasonRaceResults(seasonId: string): Promise<SeasonRaceResult[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockSeasonRaceResults(seasonId);

  const data = await loadSeasonData(client, seasonId);
  if (!data) return [];

  return data.races
    .filter((r) => r.status === "completed")
    .map((race) => {
      const drivers = data.entriesByRace[race.id] ?? [];
      const penalties = data.penaltiesByRace[race.id] ?? [];
      const winner = drivers.find((d) => d.finishPosition === 1);
      return {
        race,
        drivers,
        penalties,
        summary: computeRaceResultSummary(race, drivers, penalties),
        poleDriverId: racePoleDriverId(drivers),
        winnerId: winner?.driverId ?? null,
      };
    });
}

export async function getSeasonStandings(seasonId: string): Promise<SeasonStandingsBundle> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockSeasonStandings(seasonId);

  const data = await loadSeasonData(client, seasonId);
  if (!data) return { seasonId, final: [], snapshots: [] };
  return computedStandings(data);
}

export async function getSeasonTeamStats(seasonId: string): Promise<TeamSeasonStats[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockSeasonTeamStats(seasonId);

  const data = await loadSeasonData(client, seasonId);
  if (!data) return [];

  const final = computedStandings(data).final;

  // Resolve the driver -> team map for the whole group so the sync
  // computeTeamSeasonStats callback is correct in DB mode.
  const { data: teamRows } = await client
    .from("teams")
    .select("id")
    .eq("group_id", data.season.groupId);
  const teamIds = (teamRows ?? []).map((t) => t.id);
  const driverToTeam = new Map<string, string>();

  if (teamIds.length > 0) {
    const { data: tmRows } = await client
      .from("team_members")
      .select("team_id, driver_id")
      .in("team_id", teamIds);
    for (const row of tmRows ?? []) driverToTeam.set(row.driver_id, row.team_id);
  }

  return computeTeamSeasonStats(seasonId, data.season.name, final, (driverId) => driverToTeam.get(driverId) ?? null);
}

export async function getSeasonAwards(seasonId: string): Promise<Award[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockSeasonAwards(seasonId);

  const { data: rows } = await client.from("awards").select("*").eq("season_id", seasonId);
  return (rows ?? []).map(mapAwardRow);
}

export async function getSeasonRecords(seasonId: string): Promise<SeasonRecord[]> {
  const client = await createServerSupabaseClient();
  if (!client) return getMockSeasonRecords(seasonId);

  const { data: rows } = await client.from("season_records").select("*").eq("season_id", seasonId);
  return (rows ?? []).map(mapSeasonRecordRow);
}