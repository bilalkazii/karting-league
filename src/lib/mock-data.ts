import type { Driver } from "@/types/driver";
import type { Group, GroupMember } from "@/types/group";
import type { Team } from "@/types/team";
import type { QualifyingAttempt, Race, RaceDriver, RaceEvent, RacePenalty } from "@/types/race";
import type { Award, RaceAward, Season, SeasonRecord } from "@/types/championship";
import { DEFAULT_CHAMPIONSHIP_SCORING } from "@/lib/championship-utils";

export const mockDrivers: Driver[] = [
  {
    id: "drv_1", name: "Bilal Darji", nickname: "BD", racingNumber: 7,
    avatarColor: "#d5a182", avatarTextColor: "#29150c", rating: 1842,
    stats: { totalRaces: 23, wins: 7, podiums: 14, poles: 5, fastestLaps: 4, bestLap: "41.882", avgQualifying: "42.310", dnfs: 1, penalties: 3, penaltySeconds: 8, cleanRaces: 16, winStreak: 2, podiumStreak: 4 },
    badges: ["Pole Master", "Clean Racer", "Race Winner"], recentForm: ["podium", "win", "win", "top5", "podium"], teamId: "tm_1",
  },
  {
    id: "drv_2", name: "Ahmad Rehman", nickname: "AR", racingNumber: 14,
    avatarColor: "#7994b3", avatarTextColor: "#1a2634", rating: 1756,
    stats: { totalRaces: 19, wins: 4, podiums: 10, poles: 3, fastestLaps: 2, bestLap: "42.105", avgQualifying: "42.580", dnfs: 2, penalties: 5, penaltySeconds: 13, cleanRaces: 12, winStreak: 1, podiumStreak: 3 },
    badges: ["Podium King", "Consistent"], recentForm: ["podium", "top5", "podium", "win", "finish"], teamId: "tm_1",
  },
  {
    id: "drv_3", name: "Umar Khan", nickname: "UK", racingNumber: 3,
    avatarColor: "#8c6a52", avatarTextColor: "#ffffff", rating: 1634,
    stats: { totalRaces: 15, wins: 2, podiums: 6, poles: 1, fastestLaps: 1, bestLap: "42.440", avgQualifying: "42.920", dnfs: 2, penalties: 4, penaltySeconds: 10, cleanRaces: 9, winStreak: 1, podiumStreak: 2 },
    badges: ["Rising Star"], recentForm: ["finish", "top5", "podium", "finish", "dnf"], teamId: "tm_2",
  },
  {
    id: "drv_4", name: "Arjun Mehta", nickname: "AJ", racingNumber: 22,
    avatarColor: "#645c86", avatarTextColor: "#ffffff", rating: 1498,
    stats: { totalRaces: 8, wins: 1, podiums: 2, poles: 0, fastestLaps: 0, bestLap: "43.120", avgQualifying: "43.640", dnfs: 1, penalties: 2, penaltySeconds: 5, cleanRaces: 5, winStreak: 0, podiumStreak: 0 },
    badges: ["Newcomer"], recentForm: ["finish", "top5", "finish", "dnf", "finish"], teamId: "tm_1",
  },
  {
    id: "drv_5", name: "Zain Farooqi", nickname: "ZF", racingNumber: 9,
    avatarColor: "#5b8a72", avatarTextColor: "#ffffff", rating: 1801,
    stats: { totalRaces: 21, wins: 6, podiums: 12, poles: 4, fastestLaps: 3, bestLap: "41.950", avgQualifying: "42.410", dnfs: 1, penalties: 2, penaltySeconds: 5, cleanRaces: 15, winStreak: 1, podiumStreak: 3 },
    badges: ["Pole Master", "Clean Racer"], recentForm: ["win", "podium", "top5", "podium", "win"], teamId: "tm_3",
  },
  {
    id: "drv_6", name: "Haider Ali", nickname: "HA", racingNumber: 11,
    avatarColor: "#b88a68", avatarTextColor: "#1a1006", rating: 1312,
    stats: { totalRaces: 12, wins: 0, podiums: 2, poles: 0, fastestLaps: 0, bestLap: "43.580", avgQualifying: "44.120", dnfs: 4, penalties: 6, penaltySeconds: 18, cleanRaces: 4, winStreak: 0, podiumStreak: 0 },
    badges: ["Iron Will"], recentForm: ["dnf", "finish", "dnf", "finish", "dnf"], teamId: "tm_2",
  },
  {
    id: "drv_7", name: "Daniyal Shah", nickname: "DS", racingNumber: 5,
    avatarColor: "#435e6e", avatarTextColor: "#ffffff", rating: 1690,
    stats: { totalRaces: 17, wins: 3, podiums: 8, poles: 2, fastestLaps: 2, bestLap: "42.210", avgQualifying: "42.700", dnfs: 1, penalties: 2, penaltySeconds: 5, cleanRaces: 12, winStreak: 1, podiumStreak: 2 },
    badges: ["Consistent", "Fast Lap Hero"], recentForm: ["top5", "podium", "win", "top5", "podium"], teamId: "tm_3",
  },
  {
    id: "drv_8", name: "Omar Tanveer", nickname: "OT", racingNumber: 19,
    avatarColor: "#a67c52", avatarTextColor: "#1a1006", rating: 1555,
    stats: { totalRaces: 11, wins: 1, podiums: 3, poles: 0, fastestLaps: 1, bestLap: "42.890", avgQualifying: "43.210", dnfs: 2, penalties: 1, penaltySeconds: 3, cleanRaces: 8, winStreak: 0, podiumStreak: 1 },
    badges: [], recentForm: ["finish", "top5", "podium", "finish", "dnf"], teamId: null,
  },
];

export const mockGroups: Group[] = [
  {
    id: "grp_1", name: "Karting Crew", description: "The original weekend warriors. We race hard, laugh louder, and argue about penalties over chai.",
    logoInitials: "KC", logoColor: "#b3232d", logoTextColor: "#ffffff", coverColor: "#1a0a0c",
    privacy: "private", createdAt: "2024-06-15",
    upcomingRace: { name: "Saturday GP", date: "2025-09-13", venue: "Nashik Karting Arena", driverCount: 8 },
recentResults: [
      { name: "Monsoon Special", date: "2026-07-18", venue: "Nashik Karting Arena", winnerId: "drv_1" },
      { name: "Grand Prix Sprint", date: "2026-05-09", venue: "Pune Race Zone", winnerId: "drv_5" },
    ],
    currentChampionship: { name: "Crew Championship 2026", round: 4, totalRounds: 5, leaderId: "drv_1" },
  },
  {
    id: "grp_2", name: "Weekend Racers", description: "Sunday morning karting for those who sleep through Saturday alarms.",
    logoInitials: "WR", logoColor: "#32556b", logoTextColor: "#ffffff", coverColor: "#0b161f",
    privacy: "private", createdAt: "2025-01-10",
    upcomingRace: { name: "Sunday Showdown", date: "2025-09-21", venue: "Mumbai Karting Co.", driverCount: 6 },
    recentResults: [
      { name: "Circuit Bash", date: "2025-09-07", venue: "Mumbai Karting Co.", winnerId: "drv_5" },
    ],
    currentChampionship: null,
  },
];

export const mockGroupMembers: GroupMember[] = [
  { groupId: "grp_1", driverId: "drv_1", role: "admin", availability: "available", joinedAt: "2024-06-15", teamId: "tm_1" },
  { groupId: "grp_1", driverId: "drv_2", role: "organizer", availability: "available", joinedAt: "2024-06-15", teamId: "tm_1" },
  { groupId: "grp_1", driverId: "drv_3", role: "member", availability: "maybe", joinedAt: "2024-07-01", teamId: "tm_2" },
  { groupId: "grp_1", driverId: "drv_4", role: "member", availability: "available", joinedAt: "2025-03-10", teamId: "tm_1" },
  { groupId: "grp_1", driverId: "drv_5", role: "admin", availability: "available", joinedAt: "2024-06-15", teamId: "tm_3" },
  { groupId: "grp_1", driverId: "drv_6", role: "member", availability: "not-available", joinedAt: "2024-09-20", teamId: "tm_2" },
  { groupId: "grp_1", driverId: "drv_7", role: "member", availability: "available", joinedAt: "2024-08-01", teamId: "tm_3" },
  { groupId: "grp_1", driverId: "drv_8", role: "member", availability: "maybe", joinedAt: "2025-02-14", teamId: null },
  { groupId: "grp_2", driverId: "drv_5", role: "admin", availability: "available", joinedAt: "2025-01-10", teamId: null },
  { groupId: "grp_2", driverId: "drv_7", role: "organizer", availability: "available", joinedAt: "2025-01-12", teamId: null },
  { groupId: "grp_2", driverId: "drv_3", role: "member", availability: "available", joinedAt: "2025-01-15", teamId: null },
  { groupId: "grp_2", driverId: "drv_6", role: "member", availability: "maybe", joinedAt: "2025-02-01", teamId: null },
  { groupId: "grp_2", driverId: "drv_8", role: "member", availability: "available", joinedAt: "2025-03-01", teamId: null },
  { groupId: "grp_2", driverId: "drv_1", role: "member", availability: "not-available", joinedAt: "2025-04-20", teamId: null },
];

export const mockTeams: Team[] = [
  { id: "tm_1", groupId: "grp_1", name: "Apex Racing", logoInitials: "AR", logoColor: "#c43c2d", logoTextColor: "#ffffff", memberIds: ["drv_1", "drv_2", "drv_4"] },
  { id: "tm_2", groupId: "grp_1", name: "Redline Karting", logoInitials: "RK", logoColor: "#2d6bc4", logoTextColor: "#ffffff", memberIds: ["drv_3", "drv_6"] },
  { id: "tm_3", groupId: "grp_1", name: "Velocity Squad", logoInitials: "VS", logoColor: "#2d9c6f", logoTextColor: "#ffffff", memberIds: ["drv_5", "drv_7"] },
];

export const CURRENT_USER_ID = "drv_1";

export function getDriverById(id: string): Driver | undefined {
  return mockDrivers.find((d) => d.id === id);
}

export function getGroupById(id: string): Group | undefined {
  return mockGroups.find((g) => g.id === id);
}

export function getGroupMembers(groupId: string): GroupMember[] {
  return mockGroupMembers.filter((m) => m.groupId === groupId);
}

export function getTeamsByGroup(groupId: string): Team[] {
  return mockTeams.filter((t) => t.groupId === groupId);
}

export function getDriverGroups(driverId: string): Group[] {
  const memberGroupIds = new Set(mockGroupMembers.filter((m) => m.driverId === driverId).map((m) => m.groupId));
  return mockGroups.filter((g) => memberGroupIds.has(g.id));
}

export function getRatingLabel(rating: number): string {
  if (rating >= 1800) return "Elite";
  if (rating >= 1700) return "Expert";
  if (rating >= 1600) return "Advanced";
  if (rating >= 1500) return "Intermediate";
  return "Rookie";
}

export function getRatingColor(rating: number): string {
  if (rating >= 1800) return "bg-[var(--red)]/10 text-[var(--red-bright)] border-[var(--red)]/30";
  if (rating >= 1700) return "bg-[var(--amber)]/10 text-[var(--amber)] border-[var(--amber)]/30";
  if (rating >= 1600) return "bg-white/5 text-white border-white/15";
  if (rating >= 1500) return "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/30";
  return "bg-white/5 text-[var(--muted)] border-white/10";
}

export function getAvailabilityLabel(a: string): string {
  if (a === "available") return "Available";
  if (a === "maybe") return "Maybe";
  return "Not available";
}

export function getAvailabilityColor(a: string): string {
  if (a === "available") return "text-[var(--green)]";
  if (a === "maybe") return "text-[var(--amber)]";
  return "text-[var(--muted)]";
}

export function getRoleBadgeStyle(role: string): string {
  if (role === "admin") return "border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red-bright)]";
  if (role === "organizer") return "border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]";
  return "border-white/10 bg-white/5 text-[var(--muted)]";
}

export function getFormIcon(f: string): string {
  if (f === "win") return "W";
  if (f === "podium") return "P";
  if (f === "top5") return "T";
  if (f === "dnf") return "D";
  return "-";
}

export function getFormColor(f: string): string {
  if (f === "win") return "bg-[var(--red)] text-white";
  if (f === "podium") return "bg-[var(--amber)]/20 text-[var(--amber)]";
  if (f === "top5") return "bg-white/10 text-white";
  if (f === "dnf") return "bg-white/5 text-[var(--muted)] line-through";
  return "bg-white/5 text-[var(--muted)]";
}

export const mockRaces: Race[] = [
  {
    id: "rc_1", groupId: "grp_1", name: "Saturday GP", venueName: "Nashik Karting Arena", date: "2025-09-13", startTime: "16:00", format: "feature", status: "grid", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "One official qualifying lap. Formation lap permitted at warm-up pace. No bump drafting on the straights.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_4", "drv_5", "drv_6", "drv_7", "drv_8"],
    createdAt: "2025-09-01T09:00:00Z", updatedAt: "2025-09-10T18:00:00Z",
  },
  {
    id: "rc_2", groupId: "grp_1", name: "Monsoon Sprint", venueName: "Nashik Karting Arena", date: "2025-08-30", startTime: "15:30", format: "sprint", status: "completed", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "Qualifying 1 lap. Race 10 laps. Respect red flags during the rain.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_5", "drv_7", "drv_8"],
    createdAt: "2025-08-20T10:00:00Z", updatedAt: "2025-08-30T17:30:00Z",
  },
  {
    id: "rc_3", groupId: "grp_2", name: "Sunday Showdown", venueName: "Mumbai Karting Co.", date: "2025-09-21", startTime: "09:30", format: "sprint", status: "draft", organizerId: "drv_5", qualifyingLapCount: 1,
    rules: "",
    participatingDriverIds: ["drv_5", "drv_7", "drv_3", "drv_6", "drv_8", "drv_1"],
    createdAt: "2025-09-05T12:00:00Z", updatedAt: "2025-09-05T12:00:00Z",
  },
  {
    id: "rc_4", groupId: "grp_1", name: "Thunder Thursday", venueName: "Pune Race Zone", date: "2025-09-11", startTime: "18:30", format: "sprint", status: "lobby", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "Heads-up start. Keep one kart width apart entering turn one.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_5", "drv_7", "drv_8"],
    createdAt: "2025-09-02T09:00:00Z", updatedAt: "2025-09-08T11:00:00Z",
  },
  { id: "rc_5", groupId: "grp_1", name: "Independence Day GP", venueName: "Pune Race Zone", date: "2025-08-15", startTime: "15:30", format: "sprint", status: "completed", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "One warm-up lap behind the safety kart. Two-by-two grid start.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_4", "drv_5", "drv_6", "drv_7", "drv_8"],
    createdAt: "2025-08-01T09:00:00Z", updatedAt: "2025-08-15T17:30:00Z",
  },
  { id: "rc_6", groupId: "grp_1", name: "Heatwave Sprint", venueName: "Nashik Karting Arena", date: "2025-07-19", startTime: "16:00", format: "sprint", status: "completed", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "Single official qualifying lap. Hydration is mandatory in the summer schedule.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_4", "drv_5", "drv_6", "drv_7", "drv_8"],
    createdAt: "2025-07-05T09:00:00Z", updatedAt: "2025-07-19T17:30:00Z",
  },
  { id: "rc_7", groupId: "grp_1", name: "Season Finale", venueName: "Nashik Karting Arena", date: "2025-12-13", startTime: "17:00", format: "feature", status: "completed", organizerId: "drv_5", qualifyingLapCount: 1,
    rules: "Standard scoring applies. Respect blue flags from lap two of the feature.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_4", "drv_5", "drv_6", "drv_7", "drv_8"],
    createdAt: "2025-11-30T09:00:00Z", updatedAt: "2025-12-13T18:30:00Z",
  },
  { id: "rc_8", groupId: "grp_1", name: "Opening Sprint", venueName: "Nashik Karting Arena", date: "2026-03-14", startTime: "16:00", format: "sprint", status: "completed", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "Season opener. Rolling start after one formation lap.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_4", "drv_5", "drv_6", "drv_7", "drv_8"],
    createdAt: "2026-02-25T09:00:00Z", updatedAt: "2026-03-14T17:30:00Z",
  },
  { id: "rc_9", groupId: "grp_1", name: "Grand Prix Sprint", venueName: "Pune Race Zone", date: "2026-05-09", startTime: "15:30", format: "feature", status: "completed", organizerId: "drv_5", qualifyingLapCount: 1,
    rules: "Feature-length run. One score-counting lap for the grid.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_4", "drv_5", "drv_6", "drv_7", "drv_8"],
    createdAt: "2026-04-20T09:00:00Z", updatedAt: "2026-05-09T17:00:00Z",
  },
  { id: "rc_10", groupId: "grp_1", name: "Monsoon Special", venueName: "Nashik Karting Arena", date: "2026-07-18", startTime: "16:30", format: "sprint", status: "completed", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "Run under full wet conditions if rain holds. No red-flag restarts for drizzle.",
    participatingDriverIds: ["drv_1", "drv_2", "drv_3", "drv_5", "drv_6", "drv_7", "drv_8"],
    createdAt: "2026-07-01T09:00:00Z", updatedAt: "2026-07-18T17:45:00Z",
  },
  { id: "rc_11", groupId: "grp_1", name: "Autumn Sprint", venueName: "Pune Race Zone", date: "2026-10-03", startTime: "15:00", format: "sprint", status: "draft", organizerId: "drv_1", qualifyingLapCount: 1,
    rules: "",
    participatingDriverIds: [],
    createdAt: "2026-09-10T09:00:00Z", updatedAt: "2026-09-10T09:00:00Z",
  },
  { id: "rc_12", groupId: "grp_1", name: "Champions Finale", venueName: "Nashik Karting Arena", date: "2026-11-21", startTime: "16:00", format: "feature", status: "draft", organizerId: "drv_5", qualifyingLapCount: 1,
    rules: "",
    participatingDriverIds: [],
    createdAt: "2026-09-10T09:00:00Z", updatedAt: "2026-09-10T09:00:00Z",
  },
];

export const mockRaceDrivers: RaceDriver[] = [
  { raceId: "rc_1", driverId: "drv_1", kartNumber: 7, status: "ready", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41882, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_1", driverId: "drv_5", kartNumber: 9, status: "ready", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41950, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_1", driverId: "drv_2", kartNumber: 14, status: "ready", confirmed: true, ready: false, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 42105, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_1", driverId: "drv_7", kartNumber: 5, status: "ready", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 42210, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_1", driverId: "drv_3", kartNumber: 3, status: "ready", confirmed: true, ready: false, gridPosition: 5, gridPenaltySeconds: 5, qualifyingTimeMs: 42440, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_1", driverId: "drv_8", kartNumber: 19, status: "ready", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42890, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_1", driverId: "drv_4", kartNumber: 22, status: "ready", confirmed: true, ready: true, gridPosition: 7, gridPenaltySeconds: 0, qualifyingTimeMs: 43120, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_1", driverId: "drv_6", kartNumber: 11, status: "ready", confirmed: true, ready: false, gridPosition: 8, gridPenaltySeconds: 0, qualifyingTimeMs: 43580, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },

  { raceId: "rc_2", driverId: "drv_5", kartNumber: 9, status: "finished", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41910, qualifyingStatus: "completed", finishPosition: 1, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_2", driverId: "drv_1", kartNumber: 7, status: "finished", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41960, qualifyingStatus: "completed", finishPosition: 2, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_2", driverId: "drv_2", kartNumber: 14, status: "finished", confirmed: true, ready: true, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 42100, qualifyingStatus: "completed", finishPosition: 3, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_2", driverId: "drv_7", kartNumber: 5, status: "finished", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 42240, qualifyingStatus: "completed", finishPosition: 4, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_2", driverId: "drv_8", kartNumber: 19, status: "finished", confirmed: true, ready: true, gridPosition: 5, gridPenaltySeconds: 0, qualifyingTimeMs: 42870, qualifyingStatus: "completed", finishPosition: 5, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_2", driverId: "drv_3", kartNumber: 3, status: "dnf", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42450, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 5, notes: "Contact in race lap 3" },

  { raceId: "rc_3", driverId: "drv_5", kartNumber: 0, status: "invited", confirmed: false, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_3", driverId: "drv_7", kartNumber: 0, status: "invited", confirmed: false, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_3", driverId: "drv_3", kartNumber: 0, status: "declined", confirmed: false, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_3", driverId: "drv_6", kartNumber: 0, status: "invited", confirmed: false, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_3", driverId: "drv_8", kartNumber: 0, status: "invited", confirmed: false, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_3", driverId: "drv_1", kartNumber: 0, status: "invited", confirmed: false, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },

  { raceId: "rc_4", driverId: "drv_1", kartNumber: 11, status: "ready", confirmed: true, ready: true, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_4", driverId: "drv_2", kartNumber: 12, status: "ready", confirmed: true, ready: true, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_4", driverId: "drv_3", kartNumber: 13, status: "confirmed", confirmed: true, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_4", driverId: "drv_5", kartNumber: 14, status: "ready", confirmed: true, ready: true, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_4", driverId: "drv_7", kartNumber: 15, status: "confirmed", confirmed: true, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_4", driverId: "drv_8", kartNumber: 16, status: "confirmed", confirmed: true, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started", finishPosition: null, penaltyTotalSeconds: 0, notes: "" },

  { raceId: "rc_5", driverId: "drv_5", kartNumber: 9, status: "finished", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41700, qualifyingStatus: "completed", finishPosition: 1, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_5", driverId: "drv_1", kartNumber: 7, status: "finished", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41750, qualifyingStatus: "completed", finishPosition: 2, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_5", driverId: "drv_2", kartNumber: 14, status: "finished", confirmed: true, ready: true, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 41890, qualifyingStatus: "completed", finishPosition: 3, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_5", driverId: "drv_7", kartNumber: 5, status: "finished", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 41980, qualifyingStatus: "completed", finishPosition: 4, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_5", driverId: "drv_3", kartNumber: 3, status: "finished", confirmed: true, ready: true, gridPosition: 5, gridPenaltySeconds: 0, qualifyingTimeMs: 42420, qualifyingStatus: "completed", finishPosition: 6, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_5", driverId: "drv_8", kartNumber: 19, status: "finished", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42310, qualifyingStatus: "completed", finishPosition: 5, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_5", driverId: "drv_4", kartNumber: 22, status: "finished", confirmed: true, ready: true, gridPosition: 7, gridPenaltySeconds: 0, qualifyingTimeMs: 42600, qualifyingStatus: "completed", finishPosition: 7, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_5", driverId: "drv_6", kartNumber: 11, status: "dns", confirmed: true, ready: false, gridPosition: 8, gridPenaltySeconds: 0, qualifyingTimeMs: 42840, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "Mechanical issue — did not start" },

  { raceId: "rc_6", driverId: "drv_1", kartNumber: 7, status: "finished", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41680, qualifyingStatus: "completed", finishPosition: 1, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_6", driverId: "drv_5", kartNumber: 9, status: "finished", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41720, qualifyingStatus: "completed", finishPosition: 3, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_6", driverId: "drv_2", kartNumber: 14, status: "finished", confirmed: true, ready: true, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 41910, qualifyingStatus: "completed", finishPosition: 2, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_6", driverId: "drv_7", kartNumber: 5, status: "finished", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 42000, qualifyingStatus: "completed", finishPosition: 4, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_6", driverId: "drv_3", kartNumber: 3, status: "finished", confirmed: true, ready: true, gridPosition: 5, gridPenaltySeconds: 0, qualifyingTimeMs: 42150, qualifyingStatus: "completed", finishPosition: 5, penaltyTotalSeconds: 5, notes: "Track limits at turn 9" },
  { raceId: "rc_6", driverId: "drv_8", kartNumber: 19, status: "finished", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42360, qualifyingStatus: "completed", finishPosition: 6, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_6", driverId: "drv_4", kartNumber: 22, status: "finished", confirmed: true, ready: true, gridPosition: 7, gridPenaltySeconds: 0, qualifyingTimeMs: 42640, qualifyingStatus: "completed", finishPosition: 7, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_6", driverId: "drv_6", kartNumber: 11, status: "finished", confirmed: true, ready: true, gridPosition: 8, gridPenaltySeconds: 0, qualifyingTimeMs: 42900, qualifyingStatus: "completed", finishPosition: 8, penaltyTotalSeconds: 0, notes: "" },

  { raceId: "rc_7", driverId: "drv_2", kartNumber: 14, status: "finished", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41860, qualifyingStatus: "completed", finishPosition: 1, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_7", driverId: "drv_7", kartNumber: 5, status: "finished", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41920, qualifyingStatus: "completed", finishPosition: 2, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_7", driverId: "drv_1", kartNumber: 7, status: "finished", confirmed: true, ready: true, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 42010, qualifyingStatus: "completed", finishPosition: 3, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_7", driverId: "drv_5", kartNumber: 9, status: "retired", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 42050, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "Engine cut on lap 6" },
  { raceId: "rc_7", driverId: "drv_8", kartNumber: 19, status: "finished", confirmed: true, ready: true, gridPosition: 5, gridPenaltySeconds: 0, qualifyingTimeMs: 42380, qualifyingStatus: "completed", finishPosition: 4, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_7", driverId: "drv_3", kartNumber: 3, status: "finished", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42500, qualifyingStatus: "completed", finishPosition: 6, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_7", driverId: "drv_4", kartNumber: 22, status: "finished", confirmed: true, ready: true, gridPosition: 7, gridPenaltySeconds: 0, qualifyingTimeMs: 42610, qualifyingStatus: "completed", finishPosition: 5, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_7", driverId: "drv_6", kartNumber: 11, status: "withdrawn", confirmed: true, ready: false, gridPosition: 8, gridPenaltySeconds: 0, qualifyingTimeMs: 42870, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "Fuel cell concern — withdrawn" },

  { raceId: "rc_8", driverId: "drv_1", kartNumber: 7, status: "finished", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41750, qualifyingStatus: "completed", finishPosition: 1, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_8", driverId: "drv_5", kartNumber: 9, status: "finished", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41800, qualifyingStatus: "completed", finishPosition: 2, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_8", driverId: "drv_2", kartNumber: 14, status: "finished", confirmed: true, ready: true, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 41960, qualifyingStatus: "completed", finishPosition: 3, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_8", driverId: "drv_7", kartNumber: 5, status: "finished", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 42030, qualifyingStatus: "completed", finishPosition: 5, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_8", driverId: "drv_8", kartNumber: 19, status: "finished", confirmed: true, ready: true, gridPosition: 5, gridPenaltySeconds: 0, qualifyingTimeMs: 42290, qualifyingStatus: "completed", finishPosition: 4, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_8", driverId: "drv_3", kartNumber: 3, status: "finished", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42410, qualifyingStatus: "completed", finishPosition: 6, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_8", driverId: "drv_4", kartNumber: 22, status: "finished", confirmed: true, ready: true, gridPosition: 7, gridPenaltySeconds: 0, qualifyingTimeMs: 42680, qualifyingStatus: "completed", finishPosition: 7, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_8", driverId: "drv_6", kartNumber: 11, status: "finished", confirmed: true, ready: true, gridPosition: 8, gridPenaltySeconds: 0, qualifyingTimeMs: 42910, qualifyingStatus: "completed", finishPosition: 8, penaltyTotalSeconds: 0, notes: "" },

  { raceId: "rc_9", driverId: "drv_5", kartNumber: 9, status: "finished", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41720, qualifyingStatus: "completed", finishPosition: 1, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_9", driverId: "drv_1", kartNumber: 7, status: "finished", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41790, qualifyingStatus: "completed", finishPosition: 2, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_9", driverId: "drv_2", kartNumber: 14, status: "finished", confirmed: true, ready: true, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 41940, qualifyingStatus: "completed", finishPosition: 4, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_9", driverId: "drv_7", kartNumber: 5, status: "finished", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 42060, qualifyingStatus: "completed", finishPosition: 3, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_9", driverId: "drv_3", kartNumber: 3, status: "finished", confirmed: true, ready: true, gridPosition: 5, gridPenaltySeconds: 0, qualifyingTimeMs: 42380, qualifyingStatus: "completed", finishPosition: 5, penaltyTotalSeconds: 5, notes: "Contact under braking" },
  { raceId: "rc_9", driverId: "drv_8", kartNumber: 19, status: "finished", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42450, qualifyingStatus: "completed", finishPosition: 6, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_9", driverId: "drv_4", kartNumber: 22, status: "dnf", confirmed: true, ready: true, gridPosition: 7, gridPenaltySeconds: 0, qualifyingTimeMs: 42650, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "Spin at turn 1" },
  { raceId: "rc_9", driverId: "drv_6", kartNumber: 11, status: "dns", confirmed: true, ready: false, gridPosition: 8, gridPenaltySeconds: 0, qualifyingTimeMs: 42880, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "Starter motor failure" },

  { raceId: "rc_10", driverId: "drv_1", kartNumber: 7, status: "finished", confirmed: true, ready: true, gridPosition: 1, gridPenaltySeconds: 0, qualifyingTimeMs: 41770, qualifyingStatus: "completed", finishPosition: 1, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_10", driverId: "drv_5", kartNumber: 9, status: "finished", confirmed: true, ready: true, gridPosition: 2, gridPenaltySeconds: 0, qualifyingTimeMs: 41820, qualifyingStatus: "completed", finishPosition: 2, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_10", driverId: "drv_7", kartNumber: 5, status: "finished", confirmed: true, ready: true, gridPosition: 3, gridPenaltySeconds: 0, qualifyingTimeMs: 41990, qualifyingStatus: "completed", finishPosition: 4, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_10", driverId: "drv_2", kartNumber: 14, status: "finished", confirmed: true, ready: true, gridPosition: 4, gridPenaltySeconds: 0, qualifyingTimeMs: 42040, qualifyingStatus: "completed", finishPosition: 3, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_10", driverId: "drv_8", kartNumber: 19, status: "finished", confirmed: true, ready: true, gridPosition: 5, gridPenaltySeconds: 0, qualifyingTimeMs: 42330, qualifyingStatus: "completed", finishPosition: 5, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_10", driverId: "drv_3", kartNumber: 3, status: "finished", confirmed: true, ready: true, gridPosition: 6, gridPenaltySeconds: 0, qualifyingTimeMs: 42480, qualifyingStatus: "completed", finishPosition: 6, penaltyTotalSeconds: 0, notes: "" },
  { raceId: "rc_10", driverId: "drv_6", kartNumber: 11, status: "retired", confirmed: true, ready: true, gridPosition: 7, gridPenaltySeconds: 0, qualifyingTimeMs: 42850, qualifyingStatus: "completed", finishPosition: null, penaltyTotalSeconds: 0, notes: "Radiator stone strike" },
];

export const mockRacePenalties: RacePenalty[] = [
  { id: "pn_1", raceId: "rc_2", driverId: "drv_3", seconds: 5, reason: "Contact at hairpin turn 3", issuedBy: "drv_1", status: "issued", createdAt: "2025-08-30T17:10:00Z" },
  { id: "pn_2", raceId: "rc_6", driverId: "drv_3", seconds: 5, reason: "Track limits at turn 9", issuedBy: "drv_1", status: "issued", createdAt: "2025-07-19T17:15:00Z" },
  { id: "pn_3", raceId: "rc_9", driverId: "drv_3", seconds: 5, reason: "Contact under braking", issuedBy: "drv_5", status: "issued", createdAt: "2026-05-09T16:50:00Z" },
];

export const mockRaceEvents: RaceEvent[] = [
  { id: "ev_1", raceId: "rc_2", driverId: null, type: "qualifying_start", timestamp: "2025-08-30T15:00:00Z", metadata: { lapCount: 1 } },
  { id: "ev_2", raceId: "rc_2", driverId: "drv_5", type: "qualifying_stop", timestamp: "2025-08-30T15:08:00Z", metadata: { elapsedMs: 41910 } },
  { id: "ev_3", raceId: "rc_2", driverId: "drv_1", type: "qualifying_stop", timestamp: "2025-08-30T15:09:00Z", metadata: { elapsedMs: 41960 } },
  { id: "ev_4", raceId: "rc_2", driverId: null, type: "race_start", timestamp: "2025-08-30T16:00:00Z", metadata: { format: "sprint" } },
  { id: "ev_5", raceId: "rc_2", driverId: "drv_5", type: "race_finish", timestamp: "2025-08-30T16:14:00Z", metadata: { position: 1 } },
  { id: "ev_6", raceId: "rc_2", driverId: "drv_1", type: "race_finish", timestamp: "2025-08-30T16:15:00Z", metadata: { position: 2 } },
  { id: "ev_7", raceId: "rc_2", driverId: "drv_2", type: "race_finish", timestamp: "2025-08-30T16:16:00Z", metadata: { position: 3 } },
  { id: "ev_8", raceId: "rc_2", driverId: "drv_3", type: "dnf", timestamp: "2025-08-30T16:18:00Z", metadata: { lap: 3 } },
  { id: "ev_9", raceId: "rc_2", driverId: "drv_3", type: "penalty", timestamp: "2025-08-30T17:10:00Z", metadata: { seconds: 5, reason: "Contact at hairpin turn 3" } },
  { id: "ev_10", raceId: "rc_2", driverId: null, type: "complete", timestamp: "2025-08-30T17:30:00Z", metadata: { resultsCount: 6 } },

  { id: "ev_11", raceId: "rc_5", driverId: null, type: "qualifying_start", timestamp: "2025-08-15T15:00:00Z", metadata: { lapCount: 1 } },
  { id: "ev_12", raceId: "rc_5", driverId: "drv_5", type: "qualifying_stop", timestamp: "2025-08-15T15:05:00Z", metadata: { elapsedMs: 41700 } },
  { id: "ev_13", raceId: "rc_5", driverId: "drv_1", type: "qualifying_stop", timestamp: "2025-08-15T15:06:00Z", metadata: { elapsedMs: 41750 } },
  { id: "ev_14", raceId: "rc_5", driverId: null, type: "race_start", timestamp: "2025-08-15T15:30:00Z", metadata: { format: "sprint" } },
  { id: "ev_15", raceId: "rc_5", driverId: "drv_5", type: "race_finish", timestamp: "2025-08-15T15:43:00Z", metadata: { position: 1 } },
  { id: "ev_16", raceId: "rc_5", driverId: "drv_1", type: "race_finish", timestamp: "2025-08-15T15:44:00Z", metadata: { position: 2 } },
  { id: "ev_17", raceId: "rc_5", driverId: "drv_2", type: "race_finish", timestamp: "2025-08-15T15:45:00Z", metadata: { position: 3 } },
  { id: "ev_18", raceId: "rc_5", driverId: "drv_6", type: "dns", timestamp: "2025-08-15T15:32:00Z", metadata: { reason: "Mechanical issue" } },
  { id: "ev_19", raceId: "rc_5", driverId: "drv_5", type: "note", timestamp: "2025-08-15T16:00:00Z", metadata: { note: "Driver of the race" } },
  { id: "ev_20", raceId: "rc_5", driverId: null, type: "complete", timestamp: "2025-08-15T16:00:00Z", metadata: { resultsCount: 8 } },

  { id: "ev_21", raceId: "rc_6", driverId: null, type: "qualifying_start", timestamp: "2025-07-19T15:30:00Z", metadata: { lapCount: 1 } },
  { id: "ev_22", raceId: "rc_6", driverId: "drv_1", type: "qualifying_stop", timestamp: "2025-07-19T15:35:00Z", metadata: { elapsedMs: 41680 } },
  { id: "ev_23", raceId: "rc_6", driverId: null, type: "race_start", timestamp: "2025-07-19T16:00:00Z", metadata: { format: "sprint" } },
  { id: "ev_24", raceId: "rc_6", driverId: "drv_1", type: "race_finish", timestamp: "2025-07-19T16:13:00Z", metadata: { position: 1 } },
  { id: "ev_25", raceId: "rc_6", driverId: "drv_2", type: "race_finish", timestamp: "2025-07-19T16:14:00Z", metadata: { position: 2 } },
  { id: "ev_26", raceId: "rc_6", driverId: "drv_3", type: "penalty", timestamp: "2025-07-19T17:15:00Z", metadata: { seconds: 5, reason: "Track limits at turn 9" } },
  { id: "ev_27", raceId: "rc_6", driverId: null, type: "complete", timestamp: "2025-07-19T17:30:00Z", metadata: { resultsCount: 8 } },

  { id: "ev_28", raceId: "rc_7", driverId: null, type: "qualifying_start", timestamp: "2025-12-13T16:00:00Z", metadata: { lapCount: 1 } },
  { id: "ev_29", raceId: "rc_7", driverId: "drv_2", type: "qualifying_stop", timestamp: "2025-12-13T16:06:00Z", metadata: { elapsedMs: 41860 } },
  { id: "ev_30", raceId: "rc_7", driverId: null, type: "race_start", timestamp: "2025-12-13T17:00:00Z", metadata: { format: "feature" } },
  { id: "ev_31", raceId: "rc_7", driverId: "drv_2", type: "race_finish", timestamp: "2025-12-13T17:22:00Z", metadata: { position: 1 } },
  { id: "ev_32", raceId: "rc_7", driverId: "drv_7", type: "race_finish", timestamp: "2025-12-13T17:23:00Z", metadata: { position: 2 } },
  { id: "ev_33", raceId: "rc_7", driverId: "drv_5", type: "retired", timestamp: "2025-12-13T17:10:00Z", metadata: { lap: 6, reason: "Engine cut" } },
  { id: "ev_34", raceId: "rc_7", driverId: "drv_6", type: "dns", timestamp: "2025-12-13T17:02:00Z", metadata: { reason: "Fuel cell concern" } },
  { id: "ev_35", raceId: "rc_7", driverId: null, type: "complete", timestamp: "2025-12-13T18:30:00Z", metadata: { resultsCount: 8 } },

  { id: "ev_36", raceId: "rc_8", driverId: null, type: "qualifying_start", timestamp: "2026-03-14T15:30:00Z", metadata: { lapCount: 1 } },
  { id: "ev_37", raceId: "rc_8", driverId: "drv_1", type: "qualifying_stop", timestamp: "2026-03-14T15:36:00Z", metadata: { elapsedMs: 41750 } },
  { id: "ev_38", raceId: "rc_8", driverId: null, type: "race_start", timestamp: "2026-03-14T16:00:00Z", metadata: { format: "sprint" } },
  { id: "ev_39", raceId: "rc_8", driverId: "drv_1", type: "race_finish", timestamp: "2026-03-14T16:13:00Z", metadata: { position: 1 } },
  { id: "ev_40", raceId: "rc_8", driverId: "drv_5", type: "race_finish", timestamp: "2026-03-14T16:14:00Z", metadata: { position: 2 } },
  { id: "ev_41", raceId: "rc_8", driverId: null, type: "complete", timestamp: "2026-03-14T17:30:00Z", metadata: { resultsCount: 8 } },

  { id: "ev_42", raceId: "rc_9", driverId: null, type: "qualifying_start", timestamp: "2026-05-09T15:00:00Z", metadata: { lapCount: 1 } },
  { id: "ev_43", raceId: "rc_9", driverId: "drv_5", type: "qualifying_stop", timestamp: "2026-05-09T15:06:00Z", metadata: { elapsedMs: 41720 } },
  { id: "ev_44", raceId: "rc_9", driverId: null, type: "race_start", timestamp: "2026-05-09T15:30:00Z", metadata: { format: "feature" } },
  { id: "ev_45", raceId: "rc_9", driverId: "drv_5", type: "race_finish", timestamp: "2026-05-09T15:52:00Z", metadata: { position: 1 } },
  { id: "ev_46", raceId: "rc_9", driverId: "drv_4", type: "dnf", timestamp: "2026-05-09T15:36:00Z", metadata: { lap: 1, reason: "Spin at turn 1" } },
  { id: "ev_47", raceId: "rc_9", driverId: "drv_6", type: "dns", timestamp: "2026-05-09T15:32:00Z", metadata: { reason: "Starter motor failure" } },
  { id: "ev_48", raceId: "rc_9", driverId: "drv_3", type: "penalty", timestamp: "2026-05-09T16:50:00Z", metadata: { seconds: 5, reason: "Contact under braking" } },
  { id: "ev_49", raceId: "rc_9", driverId: null, type: "complete", timestamp: "2026-05-09T17:00:00Z", metadata: { resultsCount: 8 } },

  { id: "ev_50", raceId: "rc_10", driverId: null, type: "qualifying_start", timestamp: "2026-07-18T16:00:00Z", metadata: { lapCount: 1 } },
  { id: "ev_51", raceId: "rc_10", driverId: "drv_1", type: "qualifying_stop", timestamp: "2026-07-18T16:06:00Z", metadata: { elapsedMs: 41770 } },
  { id: "ev_52", raceId: "rc_10", driverId: null, type: "race_start", timestamp: "2026-07-18T16:30:00Z", metadata: { format: "sprint" } },
  { id: "ev_53", raceId: "rc_10", driverId: "drv_1", type: "race_finish", timestamp: "2026-07-18T16:43:00Z", metadata: { position: 1 } },
  { id: "ev_54", raceId: "rc_10", driverId: "drv_5", type: "race_finish", timestamp: "2026-07-18T16:44:00Z", metadata: { position: 2 } },
  { id: "ev_55", raceId: "rc_10", driverId: "drv_6", type: "retired", timestamp: "2026-07-18T16:38:00Z", metadata: { lap: 4, reason: "Radiator stone strike" } },
  { id: "ev_56", raceId: "rc_10", driverId: null, type: "complete", timestamp: "2026-07-18T17:45:00Z", metadata: { resultsCount: 7 } },
];

export function getRaceById(id: string): Race | undefined {
  return mockRaces.find((r) => r.id === id);
}

export function getRacesByGroupId(groupId: string): Race[] {
  return mockRaces.filter((r) => r.groupId === groupId);
}

export function getRaceDrivers(raceId: string): RaceDriver[] {
  return mockRaceDrivers.filter((d) => d.raceId === raceId);
}

export function getRaceDriver(raceId: string, driverId: string): RaceDriver | undefined {
  return mockRaceDrivers.find((d) => d.raceId === raceId && d.driverId === driverId);
}

export function getRacePenalties(raceId: string): RacePenalty[] {
  return mockRacePenalties.filter((p) => p.raceId === raceId);
}

export function getRaceEvents(raceId: string): RaceEvent[] {
  return mockRaceEvents.filter((e) => e.raceId === raceId);
}

export function getQualifyingAttempts(raceId: string): QualifyingAttempt[] {
  return getRaceDrivers(raceId).map((d) => ({
    driverId: d.driverId,
    officialTimeMs: d.qualifyingTimeMs,
    status: d.qualifyingStatus,
    kartNumber: d.kartNumber,
    gridPosition: d.gridPosition,
  }));
}

export function getRacesForUser(driverId: string): Race[] {
  const groupIds = new Set(mockGroupMembers.filter((m) => m.driverId === driverId).map((m) => m.groupId));
  return mockRaces.filter((r) => groupIds.has(r.groupId)).sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
}

export function addMockRace(race: Race): Race {
  mockRaces.push(race);
  return race;
}

export function addMockRaceDriver(driver: RaceDriver): RaceDriver {
  mockRaceDrivers.push(driver);
  return driver;
}

export function getTeamById(id: string): Team | undefined {
  return mockTeams.find((t) => t.id === id);
}

export function getTeamMembers(teamId: string): Driver[] {
  const team = mockTeams.find((t) => t.id === teamId);
  if (!team) return [];
  return mockDrivers.filter((d) => team.memberIds.includes(d.id));
}

export const mockSeasons: Season[] = [
  {
    id: "season_2025", groupId: "grp_1", name: "Crew Championship 2025", status: "completed",
    startDate: "2025-07-01", endDate: "2025-12-31",
    raceIds: ["rc_6", "rc_5", "rc_2", "rc_7"],
    scoring: { ...DEFAULT_CHAMPIONSHIP_SCORING },
    createdAt: "2025-06-15T09:00:00Z",
  },
  {
    id: "season_2026", groupId: "grp_1", name: "Crew Championship 2026", status: "active",
    startDate: "2026-01-01", endDate: "2026-12-31",
    raceIds: ["rc_8", "rc_9", "rc_10", "rc_11", "rc_12"],
    scoring: { ...DEFAULT_CHAMPIONSHIP_SCORING },
    createdAt: "2025-12-01T09:00:00Z",
  },
];

export const mockChampionshipAwards: Award[] = [
  { id: "aw_1",  seasonId: "season_2025", type: "championship_winner", label: "Champion", description: "Season champion", driverId: "drv_1", teamId: null, raceId: null, value: "77 pts" },
  { id: "aw_2",  seasonId: "season_2025", type: "team_champion",       label: "Team Champion", description: "Top-scoring team", driverId: null, teamId: "tm_1", raceId: null, value: "173 pts" },
  { id: "aw_3",  seasonId: "season_2025", type: "most_wins",           label: "Most Wins", description: "Most race wins", driverId: "drv_5", teamId: null, raceId: null, value: "2 wins" },
  { id: "aw_4",  seasonId: "season_2025", type: "most_poles",          label: "Most Poles", description: "Most pole positions", driverId: "drv_5", teamId: null, raceId: null, value: "2 poles" },
  { id: "aw_5",  seasonId: "season_2025", type: "most_podiums",        label: "Most Podiums", description: "Most top-three finishes", driverId: "drv_2", teamId: null, raceId: null, value: "4 podiums" },
  { id: "aw_6",  seasonId: "season_2025", type: "cleanest_season",     label: "Cleanest Season", description: "Most penalty-free races", driverId: "drv_7", teamId: null, raceId: null, value: "4 races" },
  { id: "aw_7",  seasonId: "season_2026", type: "championship_winner", label: "Leader After Round 3", description: "Current standings leader", driverId: "drv_1", teamId: null, raceId: null, value: "70 pts" },
  { id: "aw_8",  seasonId: "season_2026", type: "team_champion",       label: "Team Leader", description: "Leading team after round 3", driverId: null, teamId: "tm_1", raceId: null, value: "118 pts" },
  { id: "aw_9",  seasonId: "season_2026", type: "most_wins",           label: "Most Wins (3 rounds)", description: "Most race wins so far", driverId: "drv_1", teamId: null, raceId: null, value: "2 wins" },
  { id: "aw_10", seasonId: "season_2026", type: "most_poles",          label: "Most Poles (3 rounds)", description: "Most pole positions so far", driverId: "drv_1", teamId: null, raceId: null, value: "2 poles" },
  { id: "aw_11", seasonId: "season_2026", type: "cleanest_season",     label: "Cleanest Season (3 rounds)", description: "Most penalty-free races so far", driverId: "drv_1", teamId: null, raceId: null, value: "3 races" },
];

export const mockSeasonRecords: SeasonRecord[] = [
  { id: "rec_1", seasonId: "season_2025", label: "Best Qualifying", value: "41.680 s", driverId: "drv_1" },
  { id: "rec_2", seasonId: "season_2025", label: "Most Starts", value: "4 / 4", driverId: "drv_1" },
  { id: "rec_3", seasonId: "season_2025", label: "Most Wins", value: "2", driverId: "drv_5" },
  { id: "rec_4", seasonId: "season_2026", label: "Best Qualifying", value: "41.720 s", driverId: "drv_5" },
  { id: "rec_5", seasonId: "season_2026", label: "Most Starts", value: "3 / 3", driverId: "drv_1" },
  { id: "rec_6", seasonId: "season_2026", label: "Most Wins", value: "2", driverId: "drv_1" },
];

export const mockRaceAwards: RaceAward[] = [
  { raceId: "rc_5", driverOfRaceId: "drv_5", mostImprovedId: null, cleanestDriverId: "drv_7" },
  { raceId: "rc_6", driverOfRaceId: "drv_1", mostImprovedId: null, cleanestDriverId: "drv_8" },
  { raceId: "rc_7", driverOfRaceId: "drv_2", mostImprovedId: null, cleanestDriverId: "drv_7" },
  { raceId: "rc_8", driverOfRaceId: "drv_1", mostImprovedId: null, cleanestDriverId: "drv_8" },
  { raceId: "rc_9", driverOfRaceId: "drv_5", mostImprovedId: null, cleanestDriverId: "drv_7" },
  { raceId: "rc_10", driverOfRaceId: "drv_1", mostImprovedId: null, cleanestDriverId: "drv_3" },
];
