import type { Driver, DriverStats } from "@/types/driver";
import type { Group, GroupMember, GroupPrivacy } from "@/types/group";
import type { Race, RaceDriver, RaceEvent, RacePenalty } from "@/types/race";
import type { Team } from "@/types/team";
import type { Award, ChampionshipScoring, Season, SeasonRecord } from "@/types/championship";
import type { Database } from "@/types/database";

type GroupsRow = Database["public"]["Tables"]["groups"]["Row"];
type GroupMembersRow = Database["public"]["Tables"]["group_members"]["Row"];
type DriversRow = Database["public"]["Tables"]["drivers"]["Row"];
type TeamsRow = Database["public"]["Tables"]["teams"]["Row"];
type RacesRow = Database["public"]["Tables"]["races"]["Row"];
type RaceEntriesRow = Database["public"]["Tables"]["race_entries"]["Row"];
type RacePenaltiesRow = Database["public"]["Tables"]["race_penalties"]["Row"];
type RaceEventsRow = Database["public"]["Tables"]["race_events"]["Row"];
type SeasonsRow = Database["public"]["Tables"]["seasons"]["Row"];
type AwardsRow = Database["public"]["Tables"]["awards"]["Row"];
type SeasonRecordsRow = Database["public"]["Tables"]["season_records"]["Row"];

const PRIVACY: GroupPrivacy = "private";

export const EMPTY_DRIVER_STATS: DriverStats = {
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

export function mapGroupsRow(row: GroupsRow): Group {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    logoInitials: row.logo_initials,
    logoColor: row.logo_color,
    logoTextColor: row.logo_text_color,
    coverColor: row.cover_color,
    privacy: PRIVACY,
    createdAt: row.created_at,
    // Derived previews (upcomingRace, recentResults, currentChampionship)
    // are computed by the application layer and are not persisted.
    upcomingRace: null,
    recentResults: [],
    currentChampionship: null,
  };
}

export function mapGroupMemberRow(row: GroupMembersRow, teamId: string | null): GroupMember {
  return {
    groupId: row.group_id,
    driverId: row.driver_id,
    role: row.role,
    availability: row.availability,
    joinedAt: row.joined_at,
    teamId,
  };
}

export function mapDriverRow(row: DriversRow, fullName: string): Driver {
  return {
    id: row.id,
    name: fullName,
    nickname: row.nickname ?? "",
    racingNumber: row.racing_number ?? 0,
    avatarColor: row.avatar_color,
    avatarTextColor: row.avatar_text_color,
    rating: row.rating,
    // Derived aggregates are computed by the application layer (see
    // docs/phase-5-step-1.md) and never persisted, so the DB path returns
    // neutral defaults.
    stats: EMPTY_DRIVER_STATS,
    badges: [],
    recentForm: [],
    teamId: null,
  };
}

export function mapTeamRow(row: TeamsRow, memberIds: string[]): Team {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    logoInitials: row.logo_initials,
    logoColor: row.logo_color,
    logoTextColor: row.logo_text_color,
    memberIds,
  };
}

/**
 * Domain Race requires participatingDriverIds, which is derived from
 * race_entries and computed by the caller across all entries for the race.
 */
export function mapRaceRow(row: RacesRow, participatingDriverIds: string[]): Race {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    venueName: row.venue_name,
    date: row.date,
    startTime: row.start_time,
    format: row.format,
    status: row.status,
    organizerId: row.organizer_id,
    qualifyingLapCount: row.qualifying_lap_count,
    rules: row.rules,
    participatingDriverIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRaceDriverRow(row: RaceEntriesRow): RaceDriver {
  return {
    raceId: row.race_id,
    driverId: row.driver_id,
    kartNumber: row.kart_number,
    status: row.status,
    confirmed: row.confirmed,
    ready: row.ready,
    gridPosition: row.grid_position,
    gridPenaltySeconds: row.grid_penalty_seconds,
    qualifyingTimeMs: row.qualifying_time_ms,
    qualifyingStatus: row.qualifying_status,
    finishPosition: row.finish_position,
    penaltyTotalSeconds: row.penalty_total_seconds,
    notes: row.notes,
  };
}

export function mapRacePenaltyRow(row: RacePenaltiesRow): RacePenalty {
  return {
    id: row.id,
    raceId: row.race_id,
    driverId: row.driver_id,
    seconds: row.seconds,
    reason: row.reason,
    issuedBy: row.issued_by,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapRaceEventRow(row: RaceEventsRow): RaceEvent {
  return {
    id: row.id,
    raceId: row.race_id,
    driverId: row.driver_id,
    type: row.type,
    timestamp: row.occurred_at,
    metadata: (row.payload ?? {}) as RaceEvent["metadata"],
  };
}

export function mapSeasonRow(
  row: SeasonsRow,
  raceIds: string[],
  scoring: ChampionshipScoring,
): Season {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    status: row.status,
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    raceIds,
    scoring,
    createdAt: row.created_at,
  };
}

export function mapAwardRow(row: AwardsRow): Award {
  return {
    id: row.id,
    seasonId: row.season_id,
    type: row.type,
    label: row.label,
    description: row.description,
    driverId: row.driver_id,
    teamId: row.team_id,
    raceId: row.race_id,
    value: row.value,
  };
}

export function mapSeasonRecordRow(row: SeasonRecordsRow): SeasonRecord {
  return {
    id: row.id,
    seasonId: row.season_id,
    label: row.label,
    value: row.value,
    driverId: row.driver_id,
  };
}