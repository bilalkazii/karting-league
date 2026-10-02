import type { DriverAvailability } from "@/types/driver";

export type GroupRole = "admin" | "organizer" | "member";
export type GroupPrivacy = "private";

export interface GroupRacePreview {
  name: string;
  date: string;
  venue: string;
  driverCount: number;
}

export interface GroupRecentResult {
  name: string;
  date: string;
  venue: string;
  winnerId: string;
}

export interface GroupChampionshipPreview {
  name: string;
  round: number;
  totalRounds: number;
  leaderId: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  logoInitials: string;
  logoColor: string;
  logoTextColor: string;
  coverColor: string;
  privacy: GroupPrivacy;
  createdAt: string;
  upcomingRace: GroupRacePreview | null;
  recentResults: GroupRecentResult[];
  currentChampionship: GroupChampionshipPreview | null;
}

export interface GroupMember {
  groupId: string;
  driverId: string;
  role: GroupRole;
  availability: DriverAvailability;
  joinedAt: string;
  teamId: string | null;
}
