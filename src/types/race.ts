export type RaceStatus = "draft" | "lobby" | "qualifying" | "grid" | "racing" | "completed" | "cancelled";
export type RaceFormat = "sprint" | "feature" | "custom";
export type RaceDriverStatus = "invited" | "confirmed" | "declined" | "ready" | "racing" | "finished" | "dnf" | "dns" | "retired" | "withdrawn";
export type QualifyingStatus = "not_started" | "running" | "completed" | "invalid" | "manually_corrected";
export type RacePenaltyStatus = "issued" | "under_review" | "cancelled";

export type RaceEventType =
  | "qualifying_start"
  | "qualifying_stop"
  | "qualifying_invalid"
  | "qualifying_restore"
  | "qualifying_reset"
  | "qualifying_corrected"
  | "qualifying_replace"
  | "qualifying_promoted"
  | "ready"
  | "not_ready"
  | "race_start"
  | "race_finish"
  | "dnf"
  | "dns"
  | "retired"
  | "withdrawn"
  | "penalty"
  | "penalty_cancelled"
  | "grid_change"
  | "grid_penalty"
  | "complete"
  | "note"
  | "status_change";

export interface Race {
  id: string;
  groupId: string;
  name: string;
  venueName: string;
  date: string;
  startTime: string;
  format: RaceFormat;
  status: RaceStatus;
  organizerId: string;
  qualifyingLapCount: number;
  rules: string;
  participatingDriverIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RaceDriver {
  raceId: string;
  driverId: string;
  kartNumber: number;
  status: RaceDriverStatus;
  confirmed: boolean;
  ready: boolean;
  gridPosition: number | null;
  gridPenaltySeconds: number;
  qualifyingTimeMs: number | null;
  qualifyingStatus: QualifyingStatus;
  finishPosition: number | null;
  penaltyTotalSeconds: number;
  notes: string;
}

export interface RacePenalty {
  id: string;
  raceId: string;
  driverId: string;
  seconds: number;
  reason: string;
  issuedBy: string;
  status: RacePenaltyStatus;
  createdAt: string;
}

export interface RaceEvent {
  id: string;
  raceId: string;
  driverId: string | null;
  type: RaceEventType;
  timestamp: string;
  metadata: Record<string, string | number | boolean | null>;
}

export interface RaceResult {
  driverId: string;
  finishPosition: number | null;
  status: RaceDriverStatus;
  qualifyingTimeMs: number | null;
  penaltyTotalSeconds: number;
  notes: string;
}

export interface QualifyingAttempt {
  driverId: string;
  officialTimeMs: number | null;
  status: QualifyingStatus;
  kartNumber: number;
  gridPosition: number | null;
}

export interface GridPosition {
  raceId: string;
  driverId: string;
  originalPosition: number;
  gridPosition: number;
  gridPenaltySeconds: number;
  qualifyingTimeMs: number | null;
  kartNumber: number;
  ready: boolean;
}