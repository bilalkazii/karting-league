import type { Race, RaceDriver, RaceDriverStatus, RacePenalty } from "@/types/race";
import type { ChampionshipScoring, ChampionshipStanding, DriverSeasonHistoryEntry, DriverSeasonStats, RaceResultSummary, Season, TeamSeasonStats } from "@/types/championship";

export interface RacePointsEntry {
  driverId: string;
  finishPosition: number | null;
  status: RaceDriverStatus;
  basePoints: number;
  polePoints: number;
  points: number;
  clean: boolean;
}

export interface RacePointsResult {
  entries: RacePointsEntry[];
  poleDriverId: string | null;
}

export interface DriverStandingsSnapshot {
  raceId: string;
  standings: ChampionshipStanding[];
}

export interface StandingsComputation {
  final: ChampionshipStanding[];
  snapshots: DriverStandingsSnapshot[];
}

export const DEFAULT_CHAMPIONSHIP_SCORING: ChampionshipScoring = {
  mode: "automatic",
  pointsByPosition: { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4 },
  polePositionPoints: 1,
  fastestLapPoints: 0,
  participationPoints: 0,
  dnfPoints: 0,
  dnsPoints: 0,
  penaltyAdjustmentEnabled: false,
};

const classificationRank: Record<RaceDriverStatus, number> = {
  finished: 0,
  dnf: 1,
  retired: 2,
  withdrawn: 3,
  dns: 4,
  racing: 9,
  ready: 9,
  confirmed: 9,
  invited: 9,
  declined: 9,
};

function isClassified(d: RaceDriver): boolean {
  return classificationRank[d.status] <= 4;
}

export function validQualifyingTime(d: RaceDriver): boolean {
  return d.qualifyingTimeMs !== null && (d.qualifyingStatus === "completed" || d.qualifyingStatus === "manually_corrected");
}

export function racePoleDriverId(drivers: RaceDriver[]): string | null {
  const valid = drivers.filter(validQualifyingTime);
  if (valid.length === 0) return null;
  return valid.reduce((best, d) => ((d.qualifyingTimeMs as number) < (best.qualifyingTimeMs as number) ? d : best)).driverId;
}

export function computeRacePoints(drivers: RaceDriver[], scoring: ChampionshipScoring): RacePointsResult {
  const classified = drivers
    .filter(isClassified)
    .map((d) => ({ d, r: classificationRank[d.status] }))
    .sort((a, b) => a.r - b.r || (a.d.finishPosition ?? 999) - (b.d.finishPosition ?? 999) || (a.d.gridPosition ?? 999) - (b.d.gridPosition ?? 999));
  const poleId = racePoleDriverId(drivers);
  const entries = classified.map(({ d }) => {
    const finished = d.status === "finished";
    const position = finished ? (d.finishPosition ?? null) : null;
    const basePoints = finished
      ? position !== null
        ? (scoring.pointsByPosition[position] ?? 0)
        : 0
      : d.status === "dns"
        ? scoring.dnsPoints
        : scoring.dnfPoints;
    const polePoints = poleId === d.driverId ? scoring.polePositionPoints : 0;
    return {
      driverId: d.driverId,
      finishPosition: position,
      status: d.status,
      basePoints,
      polePoints,
      points: basePoints + polePoints + scoring.participationPoints,
      clean: finished,
    };
  });
  return { entries, poleDriverId: poleId };
}

interface DriverAccum {
  racesEntered: number;
  racesCompleted: number;
  wins: number;
  podiums: number;
  poles: number;
  dnfs: number;
  dns: number;
  retirements: number;
  withdrawals: number;
  penalties: number;
  penaltySeconds: number;
  points: number;
  bestQuali: number | null;
  cleanRaces: number;
}

interface StandingsInput {
  seasonId: string;
  races: Race[];
  scoring: ChampionshipScoring;
  getRaceDrivers: (raceId: string) => RaceDriver[];
  getPenalties: (raceId: string) => RacePenalty[];
}

function completedRaces(races: Race[]): Race[] {
  return races.filter((r) => r.status === "completed").sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

function accumulateStandings(races: Race[], scoring: ChampionshipScoring, getRaceDrivers: (raceId: string) => RaceDriver[], getPenalties: (raceId: string) => RacePenalty[]): Map<string, DriverAccum> {
  const acc = new Map<string, DriverAccum>();
  const bump = (driverId: string) => {
    let a = acc.get(driverId);
    if (!a) {
      a = { racesEntered: 0, racesCompleted: 0, wins: 0, podiums: 0, poles: 0, dnfs: 0, dns: 0, retirements: 0, withdrawals: 0, penalties: 0, penaltySeconds: 0, points: 0, bestQuali: null, cleanRaces: 0 };
      acc.set(driverId, a);
    }
    return a;
  };
  for (const race of races) {
    const drivers = getRaceDrivers(race.id);
    const activePenalties = getPenalties(race.id).filter((p) => p.status !== "cancelled");
    const byTime: Record<string, number> = {};
    for (const p of activePenalties) byTime[p.driverId] = (byTime[p.driverId] ?? 0) + p.seconds;
    const { entries } = computeRacePoints(drivers, scoring);
    for (const e of entries) {
      const a = bump(e.driverId);
      a.racesEntered += 1;
      a.points += e.points;
      if (e.polePoints > 0) a.poles += 1;
      if (e.status === "finished") {
        a.racesCompleted += 1;
        if (e.finishPosition === 1) a.wins += 1;
        if (e.finishPosition !== null && e.finishPosition <= 3) a.podiums += 1;
      }
      if (e.status === "dnf") a.dnfs += 1;
      if (e.status === "dns") a.dns += 1;
      if (e.status === "retired") a.retirements += 1;
      if (e.status === "withdrawn") a.withdrawals += 1;
      const penSeconds = byTime[e.driverId] ?? 0;
      if (penSeconds > 0) a.penalties += 1;
      a.penaltySeconds += penSeconds;
      if (e.clean && penSeconds === 0) a.cleanRaces += 1;
      const q = drivers.find((d) => d.driverId === e.driverId);
      if (q && validQualifyingTime(q)) {
        const t = q.qualifyingTimeMs as number;
        a.bestQuali = a.bestQuali === null ? t : Math.min(a.bestQuali, t);
      }
    }
  }
  return acc;
}

function toStandings(acc: Map<string, DriverAccum>, prev: Map<string, number> | null): ChampionshipStanding[] {
  const rows: ChampionshipStanding[] = [...acc.entries()].map(([driverId, a]) => ({
    position: 0,
    driverId,
    teamId: null,
    points: a.points,
    wins: a.wins,
    podiums: a.podiums,
    poles: a.poles,
    racesEntered: a.racesEntered,
    racesCompleted: a.racesCompleted,
    dnfs: a.dnfs,
    dns: a.dns,
    retirements: a.retirements,
    withdrawals: a.withdrawals,
    penalties: a.penalties,
    pointsGap: 0,
    previousPosition: null,
    trend: "same",
    qualifyingBest: a.bestQuali,
  }));
  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      b.podiums - a.podiums ||
      b.poles - a.poles ||
      (a.qualifyingBest ?? Number.MAX_SAFE_INTEGER) - (b.qualifyingBest ?? Number.MAX_SAFE_INTEGER) ||
      a.driverId!.localeCompare(b.driverId!),
  );
  rows.forEach((r, i) => {
    r.position = i + 1;
    r.pointsGap = rows[0].points - r.points;
    const prevPos = prev?.get(r.driverId!);
    r.previousPosition = prevPos ?? null;
    r.trend = prevPos === undefined || prevPos === null ? "same" : prevPos > r.position ? "up" : prevPos < r.position ? "down" : "same";
  });
  return rows;
}

export function computeStandings(input: StandingsInput): StandingsComputation {
  const { races, scoring, getRaceDrivers, getPenalties } = input;
  const completed = completedRaces(races);
  const snapshots: DriverStandingsSnapshot[] = [];
  let prev: Map<string, number> | null = null;
  for (let i = 0; i < completed.length; i++) {
    const slice = completed.slice(0, i + 1);
    const acc = accumulateStandings(slice, scoring, getRaceDrivers, getPenalties);
    const standings = toStandings(acc, prev);
    snapshots.push({ raceId: completed[i].id, standings });
    prev = new Map(standings.map((s) => [s.driverId!, s.position]));
  }
  const final = snapshots.length > 0 ? snapshots[snapshots.length - 1].standings : [];
  return { final, snapshots };
}

export function computeTeamSeasonStats(seasonId: string, seasonName: string, standings: ChampionshipStanding[], teamByDriver: (driverId: string) => string | null): TeamSeasonStats[] {
  const byTeam = new Map<string, { points: number; wins: number; podiums: number; poles: number; racesEntered: number; drivers: { driverId: string; points: number }[] }>();
  for (const s of standings) {
    if (!s.driverId) continue;
    const teamId = teamByDriver(s.driverId);
    if (!teamId) continue;
    let t = byTeam.get(teamId);
    if (!t) {
      t = { points: 0, wins: 0, podiums: 0, poles: 0, racesEntered: 0, drivers: [] };
      byTeam.set(teamId, t);
    }
    t.points += s.points;
    t.wins += s.wins;
    t.podiums += s.podiums;
    t.poles += s.poles;
    t.racesEntered += s.racesEntered;
    t.drivers.push({ driverId: s.driverId, points: s.points });
  }
  const rows: TeamSeasonStats[] = [...byTeam.entries()].map(([teamId, t]) => ({
    seasonId,
    seasonName,
    teamId,
    position: 0,
    points: t.points,
    wins: t.wins,
    podiums: t.podiums,
    poles: t.poles,
    racesEntered: t.racesEntered,
    drivers: t.drivers.sort((a, b) => b.points - a.points || a.driverId.localeCompare(b.driverId)),
    pointsGap: 0,
    previousPosition: null,
  }));
  rows.sort((a, b) => b.points - a.points || b.wins - a.wins || b.podiums - a.podiums || b.poles - a.poles || a.teamId.localeCompare(b.teamId));
  rows.forEach((r, i) => {
    r.position = i + 1;
    r.pointsGap = rows[0].points - r.points;
  });
  return rows;
}

export function computeRaceResultSummary(race: Race, drivers: RaceDriver[], penalties: RacePenalty[]): RaceResultSummary {
  const classified = drivers.filter(isClassified);
  const active = penalties.filter((p) => p.status !== "cancelled");
  return {
    raceId: race.id,
    raceName: race.name,
    driversEntered: classified.length,
    finishers: classified.filter((d) => d.status === "finished").length,
    dnfs: classified.filter((d) => d.status === "dnf").length,
    dns: classified.filter((d) => d.status === "dns").length,
    retirements: classified.filter((d) => d.status === "retired").length,
    withdrawn: classified.filter((d) => d.status === "withdrawn").length,
    penaltiesIssued: active.length,
    totalPenaltySeconds: active.reduce((sum, p) => sum + p.seconds, 0),
    completed: race.status === "completed",
  };
}

export function buildDriverSeasonStats(input: { driverId: string; season: Season; races: Race[]; standings: ChampionshipStanding[]; getRaceDrivers: (raceId: string) => RaceDriver[]; getPenalties: (raceId: string) => RacePenalty[] }): DriverSeasonStats | null {
  const row = input.standings.find((s) => s.driverId === input.driverId);
  if (!row) return null;
  const qualiTimes: number[] = [];
  let clean = 0;
  for (const race of completedRaces(input.races)) {
    const d = input.getRaceDrivers(race.id).find((x) => x.driverId === input.driverId);
    if (d && validQualifyingTime(d)) qualiTimes.push(d.qualifyingTimeMs as number);
    const penSeconds = input.getPenalties(race.id).filter((p) => p.driverId === input.driverId && p.status !== "cancelled").reduce((sum, p) => sum + p.seconds, 0);
    if (d && d.status === "finished" && penSeconds === 0) clean += 1;
  }
  return {
    driverId: input.driverId,
    seasonId: input.season.id,
    seasonName: input.season.name,
    races: row.racesEntered,
    wins: row.wins,
    podiums: row.podiums,
    poles: row.poles,
    qualifyingBest: row.qualifyingBest === null ? null : row.qualifyingBest / 1000,
    qualifyingBestTimeMs: row.qualifyingBest,
    qualifyingAverage: qualiTimes.length > 0 ? qualiTimes.reduce((a, b) => a + b, 0) / qualiTimes.length / 1000 : null,
    bestLapMs: null,
    dnfs: row.dnfs,
    dns: row.dns,
    retirements: row.retirements,
    withdrawals: row.withdrawals,
    penalties: row.penalties,
    penaltySeconds: 0,
    cleanRaces: clean,
    points: row.points,
    currentPosition: row.position,
    previousPosition: row.previousPosition,
  };
}

export function buildDriverCareerHistory(driverId: string, seasons: Season[], getStandings: (seasonId: string) => ChampionshipStanding[]): DriverSeasonHistoryEntry[] {
  return seasons
    .map((season) => {
      const row = getStandings(season.id).find((s) => s.driverId === driverId);
      return {
        seasonId: season.id,
        seasonName: season.name,
        status: season.status,
        position: row?.position ?? null,
        points: row?.points ?? 0,
        wins: row?.wins ?? 0,
        podiums: row?.podiums ?? 0,
        poles: row?.poles ?? 0,
        races: row?.racesEntered ?? 0,
      };
    })
    .sort((a, b) => b.seasonName.localeCompare(a.seasonName));
}

export interface CsvStandingRow {
  position: number;
  name: string;
  team: string;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  penalties: number;
}

export function standingsCsv(title: string, rows: CsvStandingRow[]): string {
  const header = ["Position", "Name", "Team", "Points", "Wins", "Podiums", "Poles", "Penalties"];
  const lines = rows.map((r) => [r.position, r.name, r.team, r.points, r.wins, r.podiums, r.poles, r.penalties].join(","));
  return [title, header.join(","), ...lines].join("\n");
}