export type DriverAvailability = "available" | "maybe" | "not-available";

export interface DriverStats {
  totalRaces: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  bestLap: string | null;
  avgQualifying: string | null;
  dnfs: number;
  penalties: number;
  penaltySeconds: number;
  cleanRaces: number;
  winStreak: number;
  podiumStreak: number;
}

export interface Driver {
  id: string;
  name: string;
  nickname: string;
  racingNumber: number;
  avatarColor: string;
  avatarTextColor: string;
  rating: number;
  stats: DriverStats;
  badges: string[];
  recentForm: ("win" | "podium" | "top5" | "dnf" | "finish")[];
  teamId: string | null;
}
