import type { Race, RaceDriver, RacePenalty } from "@/types/race";
import type { Driver } from "@/types/driver";
import type { Team } from "@/types/team";
import type {
  Award,
  ChampionshipScoring,
  ChampionshipStanding,
  DriverSeasonHistoryEntry,
  DriverSeasonStats,
  RaceAward,
  RaceResultSummary,
  Season,
  SeasonRecord,
  TeamSeasonStats,
} from "@/types/championship";
import {
  buildDriverCareerHistory,
  buildDriverSeasonStats,
  computeRacePoints,
  computeRaceResultSummary,
  computeStandings,
  computeTeamSeasonStats,
  DEFAULT_CHAMPIONSHIP_SCORING,
  racePoleDriverId,
  type DriverStandingsSnapshot,
  type RacePointsResult,
} from "@/lib/championship-utils";
import {
  getRaceById,
  getRaceDrivers,
  getRacePenalties,
  getDriverById,
  getTeamById,
  mockChampionshipAwards,
  mockGroupMembers,
  mockRaceAwards,
  mockSeasonRecords,
  mockSeasons,
  mockTeams,
} from "@/lib/mock-data";
import type { StandingRowData } from "@/components/championship/standing-row";

export interface SeasonRaceResult {
  race: Race;
  drivers: RaceDriver[];
  penalties: RacePenalty[];
  summary: RaceResultSummary;
  poleDriverId: string | null;
  winnerId: string | null;
}

export interface SeasonStandingsBundle {
  seasonId: string;
  final: ChampionshipStanding[];
  snapshots: DriverStandingsSnapshot[];
}

export interface DriverCareerStats {
  driverId: string;
  seasons: number;
  races: number;
  wins: number;
  podiums: number;
  poles: number;
  dnfs: number;
  retirements: number;
  penalties: number;
  points: number;
  bestSeasonId: string | null;
  bestSeasonName: string | null;
  bestSeasonPosition: number | null;
  bestSeasonPoints: number | null;
}

export function teamByDriver(driverId: string): string | null {
  return mockTeams.find((t) => t.memberIds.includes(driverId))?.id ?? null;
}

export function getSeasonForRace(raceId: string): Season | undefined {
  return mockSeasons.find((s) => s.raceIds.includes(raceId));
}

export function getSeasonById(seasonId: string): Season | undefined {
  return mockSeasons.find((s) => s.id === seasonId);
}

export function getSeasonsForUser(driverId: string): Season[] {
  const groupIds = new Set(mockGroupMembers.filter((m) => m.driverId === driverId).map((m) => m.groupId));
  return mockSeasons.filter((s) => groupIds.has(s.groupId));
}

export function getActiveSeason(groupId: string): Season | undefined {
  return mockSeasons.find((s) => s.groupId === groupId && s.status === "active");
}

export function getActiveSeasonForDriver(driverId: string): Season | undefined {
  const groupIds = new Set(mockGroupMembers.filter((m) => m.driverId === driverId).map((m) => m.groupId));
  for (const groupId of groupIds) {
    const season = getActiveSeason(groupId);
    if (season) return season;
  }
  return undefined;
}

/**
 * Presentational row-builder for the driver standings table. Resolves each
 * standing's identity via the provided resolver. When no resolver is given,
 * the sync mock helper (getDriverById) is used, so this function keeps the
 * exact mock behavior in mock mode and anywhere the DB is unavailable.
 */
export function driverStandingRowData(standings: ChampionshipStanding[], resolveDriver?: (driverId: string) => Driver | null): StandingRowData[] {
  return standings.map((s) => {
    const driver = s.driverId ? (resolveDriver ? resolveDriver(s.driverId) : getDriverById(s.driverId)) : null;
    return {
      position: s.position,
      name: driver?.name ?? "Unknown",
      meta: driver ? `${driver.nickname} · #${driver.racingNumber}` : undefined,
      mark: driver ? { initials: driver.nickname, color: driver.avatarColor, textColor: driver.avatarTextColor } : null,
      points: s.points,
      pointsGap: s.pointsGap,
      wins: s.wins,
      podiums: s.podiums,
      poles: s.poles,
      racesEntered: s.racesEntered,
      dnfs: s.dnfs,
      penalties: s.penalties,
      previousPosition: s.previousPosition,
      trend: s.trend,
    };
  });
}

/**
 * Presentational row-builder for the team standings table. When no resolver
 * is given, the sync mock helper (getTeamById) is used.
 */
export function teamStandingRowData(stats: TeamSeasonStats[], resolveTeam?: (teamId: string) => Team | null): StandingRowData[] {
  return stats.map((ts) => {
    const team = resolveTeam ? resolveTeam(ts.teamId) : getTeamById(ts.teamId);
    return {
      position: ts.position ?? 0,
      name: team?.name ?? "Unknown",
      meta: `${ts.drivers.length} drivers`,
      mark: team ? { initials: team.logoInitials, color: team.logoColor, textColor: team.logoTextColor } : null,
      points: ts.points,
      pointsGap: ts.pointsGap ?? 0,
      wins: ts.wins,
      podiums: ts.podiums,
      poles: ts.poles,
      racesEntered: ts.racesEntered,
      dnfs: 0,
      penalties: 0,
      previousPosition: ts.previousPosition,
      trend: "same",
    };
  });
}

export function getSeasonRaces(seasonId: string): Race[] {
  const season = getSeasonById(seasonId);
  if (!season) return [];
  return season.raceIds
    .map((id) => getRaceById(id))
    .filter((r): r is Race => Boolean(r));
}

export function getSeasonRaceResults(seasonId: string): SeasonRaceResult[] {
  return getSeasonRaces(seasonId)
    .filter((r) => r.status === "completed")
    .map((race) => {
      const drivers = getRaceDrivers(race.id);
      const penalties = getRacePenalties(race.id);
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

export function getSeasonStandings(seasonId: string): SeasonStandingsBundle {
  const season = getSeasonById(seasonId);
  if (!season) return { seasonId, final: [], snapshots: [] };
  const computed = computeStandings({
    seasonId,
    races: getSeasonRaces(seasonId),
    scoring: season.scoring,
    getRaceDrivers,
    getPenalties: getRacePenalties,
  });
  return { seasonId, final: computed.final, snapshots: computed.snapshots };
}

export function getSeasonDriverStats(seasonId: string): DriverSeasonStats[] {
  const season = getSeasonById(seasonId);
  const bundle = getSeasonStandings(seasonId);
  if (!season) return [];
  const stats: DriverSeasonStats[] = [];
  for (const standing of bundle.final) {
    if (!standing.driverId) continue;
    const row = buildDriverSeasonStats({
      driverId: standing.driverId,
      season,
      races: getSeasonRaces(seasonId),
      standings: bundle.final,
      getRaceDrivers,
      getPenalties: getRacePenalties,
    });
    if (row) stats.push(row);
  }
  return stats.sort((a, b) => (a.currentPosition ?? 999) - (b.currentPosition ?? 999));
}

export function getSeasonTeamStats(seasonId: string): TeamSeasonStats[] {
  const season = getSeasonById(seasonId);
  if (!season) return [];
  const bundle = getSeasonStandings(seasonId);
  return computeTeamSeasonStats(seasonId, season.name, bundle.final, teamByDriver);
}

export function getSeasonAwards(seasonId: string): Award[] {
  return mockChampionshipAwards.filter((a) => a.seasonId === seasonId);
}

export function getSeasonRecords(seasonId: string): SeasonRecord[] {
  return mockSeasonRecords.filter((r) => r.seasonId === seasonId);
}

export function getRaceAward(raceId: string): RaceAward | undefined {
  return mockRaceAwards.find((a) => a.raceId === raceId);
}

export function getRaceResultSummary(raceId: string): RaceResultSummary | undefined {
  const race = getRaceById(raceId);
  if (!race) return undefined;
  return computeRaceResultSummary(race, getRaceDrivers(raceId), getRacePenalties(raceId));
}

export function getRacePoints(raceId: string, scoringOverride?: ChampionshipScoring): RacePointsResult {
  const race = getRaceById(raceId);
  const scoring = scoringOverride ?? getSeasonForRace(raceId)?.scoring ?? DEFAULT_CHAMPIONSHIP_SCORING;
  return computeRacePoints(race ? getRaceDrivers(raceId) : [], scoring);
}

export function getDriverCareerStats(driverId: string): DriverCareerStats {
  let seasons = 0;
  let races = 0;
  let wins = 0;
  let podiums = 0;
  let poles = 0;
  let dnfs = 0;
  let retirements = 0;
  let penalties = 0;
  let points = 0;
  let best: { seasonId: string; seasonName: string; position: number; points: number } | null = null;
  for (const season of mockSeasons) {
    const row = getSeasonStandings(season.id).final.find((s) => s.driverId === driverId);
    if (!row) continue;
    seasons += 1;
    races += row.racesEntered;
    wins += row.wins;
    podiums += row.podiums;
    poles += row.poles;
    dnfs += row.dnfs;
    retirements += row.retirements;
    penalties += row.penalties;
    points += row.points;
    if (row.position !== null && (best === null || row.position < best.position)) {
      best = { seasonId: season.id, seasonName: season.name, position: row.position, points: row.points };
    }
  }
  return {
    driverId,
    seasons,
    races,
    wins,
    podiums,
    poles,
    dnfs,
    retirements,
    penalties,
    points,
    bestSeasonId: best?.seasonId ?? null,
    bestSeasonName: best?.seasonName ?? null,
    bestSeasonPosition: best?.position ?? null,
    bestSeasonPoints: best?.points ?? null,
  };
}

export function getDriverCareerHistory(driverId: string): DriverSeasonHistoryEntry[] {
  return buildDriverCareerHistory(driverId, mockSeasons, (seasonId) => getSeasonStandings(seasonId).final);
}

export interface ChampionshipDataIntegrity {
  valid: boolean;
  problems: string[];
}

export function validateChampionshipMockData(): ChampionshipDataIntegrity {
  const problems: string[] = [];
  const seasonIds = new Set<string>();

  for (const season of mockSeasons) {
    if (seasonIds.has(season.id)) problems.push(`Duplicate season id: ${season.id}`);
    seasonIds.add(season.id);
    for (const raceId of season.raceIds) {
      const race = getRaceById(raceId);
      if (!race) {
        problems.push(`Season ${season.id} references unknown race ${raceId}`);
        continue;
      }
      if (race.groupId !== season.groupId) problems.push(`Season ${season.id} references race ${raceId} from group ${race.groupId}`);
      if (race.status !== "draft" && getRaceDrivers(raceId).length === 0) problems.push(`Season ${season.id} race ${raceId} has no driver rows`);
      if (race.status === "completed" && !getRaceDrivers(raceId).some((d) => d.finishPosition === 1)) {
        problems.push(`Season ${season.id} completed race ${raceId} has no classified winner`);
      }
    }
  }

  for (const award of mockChampionshipAwards) {
    if (!getSeasonById(award.seasonId)) problems.push(`Award ${award.id} references unknown season ${award.seasonId}`);
  }

  for (const record of mockSeasonRecords) {
    if (!getSeasonById(record.seasonId)) problems.push(`Record ${record.id} references unknown season ${record.seasonId}`);
  }

  for (const raceAward of mockRaceAwards) {
    const race = getRaceById(raceAward.raceId);
    if (!race) {
      problems.push(`Race award references unknown race ${raceAward.raceId}`);
      continue;
    }
    const entered = new Set(getRaceDrivers(raceAward.raceId).map((d) => d.driverId));
    for (const candidate of [raceAward.driverOfRaceId, raceAward.mostImprovedId, raceAward.cleanestDriverId]) {
      if (candidate && !entered.has(candidate)) {
        problems.push(`Race award ${raceAward.raceId} references driver ${candidate} not entered in the race`);
      }
    }
  }

  for (const season of mockSeasons) {
    const bundle = getSeasonStandings(season.id);
    if (bundle.final.length === 0) continue;
    const leader = bundle.final[0];
    const seasonAwards = getSeasonAwards(season.id);
    const champAward = seasonAwards.find((a) => a.type === "championship_winner");
    if (champAward?.driverId && champAward.driverId !== leader.driverId) {
      problems.push(`Season ${season.id} champion award ${champAward.driverId} does not match standings leader ${leader.driverId}`);
    }
    const teamChampAward = seasonAwards.find((a) => a.type === "team_champion");
    if (teamChampAward?.teamId) {
      const teams = computeTeamSeasonStats(season.id, season.name, bundle.final, teamByDriver);
      if (teams.length > 0 && teams[0].teamId !== teamChampAward.teamId) {
        problems.push(`Season ${season.id} team champion award ${teamChampAward.teamId} does not match team leader ${teams[0].teamId}`);
      }
    }
  }

  return { valid: problems.length === 0, problems };
}

export const championshipDataIntegrity = validateChampionshipMockData();

if (!championshipDataIntegrity.valid) {
  throw new Error(`Championship mock data integrity failed:\n- ${championshipDataIntegrity.problems.join("\n- ")}`);
}