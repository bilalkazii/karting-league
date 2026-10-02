export type SeasonStatus = "draft" | "active" | "completed" | "archived";

export type AwardType =
  | "winner"
  | "podium"
  | "pole"
  | "driver_of_race"
  | "most_improved"
  | "cleanest_driver"
  | "championship_winner"
  | "team_champion"
  | "most_wins"
  | "most_poles"
  | "most_podiums"
  | "cleanest_season"
  | "participation";

export type ShareCardType =
  | "race_winner"
  | "podium"
  | "pole_position"
  | "qualifying"
  | "championship_standings"
  | "driver_profile"
  | "season_award";

export type StandingTrend = "up" | "down" | "same";

export interface ChampionshipScoring {
  mode: "automatic" | "custom";
  pointsByPosition: Record<number, number>;
  polePositionPoints: number;
  fastestLapPoints: number;
  participationPoints: number;
  dnfPoints: number;
  dnsPoints: number;
  penaltyAdjustmentEnabled: boolean;
}

export interface ChampionshipPointsRule {
  id: string;
  seasonId: string;
  label: string;
  position: number | null;
  points: number;
}

export interface Season {
  id: string;
  groupId: string;
  name: string;
  status: SeasonStatus;
  startDate: string;
  endDate: string;
  raceIds: string[];
  scoring: ChampionshipScoring;
  createdAt: string;
}

export interface ChampionshipEntry {
  seasonId: string;
  driverId: string;
  teamId: string | null;
  racesEntered: number;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
}

export interface ChampionshipStanding {
  position: number;
  driverId: string | null;
  teamId: string | null;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  racesEntered: number;
  racesCompleted: number;
  dnfs: number;
  dns: number;
  retirements: number;
  withdrawals: number;
  penalties: number;
  pointsGap: number;
  previousPosition: number | null;
  trend: StandingTrend;
  qualifyingBest: number | null;
}

export interface DriverSeasonStats {
  driverId: string;
  seasonId: string;
  seasonName: string;
  races: number;
  wins: number;
  podiums: number;
  poles: number;
  qualifyingBest: number | null;
  qualifyingBestTimeMs: number | null;
  qualifyingAverage: number | null;
  bestLapMs: number | null;
  dnfs: number;
  dns: number;
  retirements: number;
  withdrawals: number;
  penalties: number;
  penaltySeconds: number;
  cleanRaces: number;
  points: number;
  currentPosition: number | null;
  previousPosition: number | null;
}

export interface TeamSeasonStats {
  teamId: string;
  seasonId: string;
  seasonName: string;
  position: number | null;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  racesEntered: number;
  drivers: { driverId: string; points: number }[];
  pointsGap: number | null;
  previousPosition: number | null;
}

export interface DriverSeasonHistoryEntry {
  seasonId: string;
  seasonName: string;
  status: SeasonStatus;
  position: number | null;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  races: number;
}

export interface Award {
  id: string;
  seasonId: string;
  type: AwardType;
  label: string;
  description: string;
  driverId: string | null;
  teamId: string | null;
  raceId: string | null;
  value: string | null;
}

export interface RaceAward {
  raceId: string;
  driverOfRaceId: string | null;
  mostImprovedId: string | null;
  cleanestDriverId: string | null;
}

export interface SeasonRecord {
  id: string;
  seasonId: string;
  label: string;
  value: string;
  driverId: string | null;
}

export interface RaceResultSummary {
  raceId: string;
  raceName: string;
  driversEntered: number;
  finishers: number;
  dnfs: number;
  dns: number;
  retirements: number;
  withdrawn: number;
  penaltiesIssued: number;
  totalPenaltySeconds: number;
  completed: boolean;
}