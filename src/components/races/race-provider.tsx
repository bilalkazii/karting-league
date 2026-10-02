"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { computeGridRows, buildFinalResults, qualifyingRows, poleTime } from "@/lib/race-utils";
import type { QualifyingStatus, Race, RaceDriver, RaceDriverStatus, RaceEvent, RaceEventType, RacePenalty, RaceStatus } from "@/types/race";

type PendingOp =
  | { kind: "replace"; driverId: string; elapsedMs: number }
  | { kind: "clear"; driverId: string }
  | null;

interface RaceState {
  race: Race;
  drivers: RaceDriver[];
  penalties: RacePenalty[];
  events: RaceEvent[];
  activeStopwatch: string | null;
  pending: PendingOp;
  finishCounter: number;
}

type RaceAction =
  | { type: "set_status"; status: RaceStatus }
  | { type: "start_qualifying" }
  | { type: "start_stopwatch"; driverId: string }
  | { type: "stop_stopwatch"; driverId: string; elapsedMs: number }
  | { type: "resolve_pending"; action: "confirm" | "discard" }
  | { type: "request_clear"; driverId: string }
  | { type: "cancel_pending" }
  | { type: "invalidate_time"; driverId: string }
  | { type: "restore_time"; driverId: string }
  | { type: "manual_correct"; driverId: string; elapsedMs: number }
  | { type: "set_grid_position"; driverId: string; position: number | null }
  | { type: "set_grid_penalty"; driverId: string; seconds: number }
  | { type: "set_kart"; driverId: string; kartNumber: number }
  | { type: "toggle_ready"; driverId: string }
  | { type: "toggle_confirmed"; driverId: string }
  | { type: "set_participants"; driverIds: string[] }
  | { type: "lock_grid" }
  | { type: "start_race" }
  | { type: "finish_driver"; driverId: string }
  | { type: "set_driver_status"; driverId: string; status: RaceDriverStatus }
  | { type: "add_penalty"; driverId: string; seconds: number; reason: string }
  | { type: "cancel_penalty"; penaltyId: string }
  | { type: "complete_race" };

const EVENT_TYPES: Record<RaceDriverStatus, RaceEventType> = { finished: "race_finish", dnf: "dnf", dns: "dns", retired: "retired", withdrawn: "withdrawn", racing: "note", ready: "note", confirmed: "note", invited: "note", declined: "note" };

function nowIso(): string { return new Date().toISOString(); }

function reducer(state: RaceState, action: RaceAction): RaceState {
  const touch = (overrides: Partial<RaceState>): RaceState => ({ ...state, ...overrides, race: { ...state.race, updatedAt: nowIso() } });

  switch (action.type) {
    case "set_status":
      return touch({ race: { ...state.race, status: action.status, updatedAt: nowIso() }, events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: null, type: "status_change", timestamp: nowIso(), metadata: { status: action.status } }] });

    case "start_qualifying":
      if (state.race.status !== "lobby") return state;
      return touch({ race: { ...state.race, status: "qualifying", updatedAt: nowIso() }, events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: null, type: "qualifying_start", timestamp: nowIso(), metadata: { lapCount: state.race.qualifyingLapCount } }] });

    case "start_stopwatch":
      if (state.activeStopwatch !== null) return state;
      if (!state.drivers.some((d) => d.driverId === action.driverId)) return state;
      return touch({ activeStopwatch: action.driverId });

    case "stop_stopwatch": {
      if (state.activeStopwatch !== action.driverId) return state;
      const driver = state.drivers.find((d) => d.driverId === action.driverId);
      if (!driver) return state;
      const isOfficial = driver.qualifyingTimeMs !== null && (driver.qualifyingStatus === "completed" || driver.qualifyingStatus === "manually_corrected");
      if (isOfficial) return touch({ activeStopwatch: null, pending: { kind: "replace", driverId: action.driverId, elapsedMs: action.elapsedMs } });
      return touch({
        activeStopwatch: null,
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, qualifyingTimeMs: action.elapsedMs, qualifyingStatus: "completed" as QualifyingStatus } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: "qualifying_stop", timestamp: nowIso(), metadata: { elapsedMs: action.elapsedMs } }],
      });
    }

    case "resolve_pending": {
      const pending = state.pending;
      if (!pending) return touch({ pending: null });
      if (action.action === "discard") return touch({ pending: null });
      if (pending.kind === "replace") {
        return touch({
          pending: null,
          drivers: state.drivers.map((d) => d.driverId === pending.driverId ? { ...d, qualifyingTimeMs: pending.elapsedMs, qualifyingStatus: "completed" as QualifyingStatus } : d),
          events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: pending.driverId, type: "qualifying_replace", timestamp: nowIso(), metadata: { elapsedMs: pending.elapsedMs } }],
        });
      }
      if (pending.kind === "clear") {
        return touch({
          pending: null,
          drivers: state.drivers.map((d) => d.driverId === pending.driverId ? { ...d, qualifyingTimeMs: null, qualifyingStatus: "not_started" as QualifyingStatus } : d),
          events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: pending.driverId, type: "qualifying_reset", timestamp: nowIso(), metadata: {} }],
        });
      }
      return touch({ pending: null });
    }

    case "request_clear":
      return touch({ pending: { kind: "clear", driverId: action.driverId } });

    case "cancel_pending":
      return touch({ pending: null });

    case "invalidate_time":
      return touch({
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, qualifyingStatus: "invalid" as QualifyingStatus } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: "qualifying_invalid", timestamp: nowIso(), metadata: {} }],
      });

    case "restore_time":
      return touch({
        drivers: state.drivers.map((d) => d.driverId === action.driverId && d.qualifyingStatus === "invalid" ? { ...d, qualifyingStatus: "completed" as QualifyingStatus } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: "qualifying_restore", timestamp: nowIso(), metadata: {} }],
      });

    case "manual_correct": {
      const driver = state.drivers.find((d) => d.driverId === action.driverId);
      if (!driver) return state;
      if (action.elapsedMs <= 0 || action.elapsedMs > 3600000) return state;
      return touch({
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, qualifyingTimeMs: action.elapsedMs, qualifyingStatus: "manually_corrected" as QualifyingStatus } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: "qualifying_corrected", timestamp: nowIso(), metadata: { elapsedMs: action.elapsedMs } }],
      });
    }

    case "set_grid_position":
      return touch({ drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, gridPosition: action.position } : d) });

    case "set_grid_penalty":
      return touch({
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, gridPenaltySeconds: Math.max(0, Math.round(action.seconds)) } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: "grid_penalty", timestamp: nowIso(), metadata: { seconds: Math.max(0, Math.round(action.seconds)) } }],
      });

    case "set_kart":
      return touch({ drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, kartNumber: Math.max(0, Math.round(action.kartNumber)) } : d) });

    case "toggle_ready": {
      const driver = state.drivers.find((d) => d.driverId === action.driverId);
      if (!driver || !driver.confirmed) return state;
      const ready = !driver.ready;
      return touch({
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, ready, status: ready ? "ready" as RaceDriverStatus : "confirmed" as RaceDriverStatus } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: ready ? "ready" as RaceEventType : "not_ready" as RaceEventType, timestamp: nowIso(), metadata: {} }],
      });
    }

    case "toggle_confirmed": {
      const driver = state.drivers.find((d) => d.driverId === action.driverId);
      if (!driver) return state;
      const confirmed = !driver.confirmed;
      return touch({
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, confirmed, ready: confirmed ? d.ready : false, status: confirmed ? (d.ready ? "ready" as RaceDriverStatus : "confirmed" as RaceDriverStatus) : "invited" as RaceDriverStatus } : d),
      });
    }

    case "set_participants": {
      const keep = new Set(action.driverIds);
      const existing = new Set(state.drivers.map((d) => d.driverId));
      const additions: RaceDriver[] = action.driverIds.filter((id) => !existing.has(id)).map((id) => ({
        raceId: state.race.id, driverId: id, kartNumber: 0, status: "invited" as RaceDriverStatus, confirmed: false, ready: false, gridPosition: null, gridPenaltySeconds: 0, qualifyingTimeMs: null, qualifyingStatus: "not_started" as QualifyingStatus, finishPosition: null, penaltyTotalSeconds: 0, notes: "",
      }));
      return touch({
        race: { ...state.race, participatingDriverIds: action.driverIds, updatedAt: nowIso() },
        drivers: [...state.drivers.filter((d) => keep.has(d.driverId)), ...additions],
      });
    }

    case "lock_grid": {
      if (state.race.status !== "qualifying") return state;
      const rows = computeGridRows(state.drivers);
      return touch({
        race: { ...state.race, status: "grid", updatedAt: nowIso() },
        drivers: state.drivers.map((d) => {
          const row = rows.find((r) => r.driverId === d.driverId);
          return row ? { ...d, gridPosition: row.gridPosition } : d;
        }),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: null, type: "status_change", timestamp: nowIso(), metadata: { status: "grid" } }],
      });
    }

    case "start_race": {
      if (state.race.status !== "grid") return state;
      return touch({
        race: { ...state.race, status: "racing", updatedAt: nowIso() },
        drivers: state.drivers.map((d) => d.confirmed && d.ready ? { ...d, status: "racing" as RaceDriverStatus } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: null, type: "race_start", timestamp: nowIso(), metadata: { format: state.race.format } }],
      });
    }

    case "finish_driver": {
      if (state.race.status !== "racing") return state;
      const driver = state.drivers.find((d) => d.driverId === action.driverId);
      if (!driver || driver.status === "finished") return state;
      return touch({
        finishCounter: state.finishCounter + 1,
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, status: "finished" as RaceDriverStatus, finishPosition: state.finishCounter } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: "race_finish", timestamp: nowIso(), metadata: { position: state.finishCounter } }],
      });
    }

    case "set_driver_status": {
      const driver = state.drivers.find((d) => d.driverId === action.driverId);
      if (!driver || driver.status === action.status) return state;
      const isFinish = action.status === "finished";
      const pos = isFinish ? (driver.finishPosition ?? state.finishCounter) : null;
      return touch({
        finishCounter: isFinish && driver.finishPosition === null ? state.finishCounter + 1 : state.finishCounter,
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, status: action.status, finishPosition: pos } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: EVENT_TYPES[action.status], timestamp: nowIso(), metadata: pos !== null ? { position: pos } : {} }],
      });
    }

    case "add_penalty": {
      if (action.seconds <= 0 || !action.reason.trim()) return state;
      const penalty: RacePenalty = { id: `pn_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, seconds: action.seconds, reason: action.reason, issuedBy: state.race.organizerId, status: "issued", createdAt: nowIso() };
      return touch({
        penalties: [...state.penalties, penalty],
        drivers: state.drivers.map((d) => d.driverId === action.driverId ? { ...d, penaltyTotalSeconds: d.penaltyTotalSeconds + action.seconds } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: action.driverId, type: "penalty", timestamp: nowIso(), metadata: { seconds: action.seconds, reason: action.reason } }],
      });
    }

    case "cancel_penalty": {
      const penalty = state.penalties.find((p) => p.id === action.penaltyId);
      if (!penalty || penalty.status === "cancelled") return state;
      return touch({
        penalties: state.penalties.map((p) => p.id === action.penaltyId ? { ...p, status: "cancelled" as const } : p),
        drivers: state.drivers.map((d) => d.driverId === penalty.driverId ? { ...d, penaltyTotalSeconds: Math.max(0, d.penaltyTotalSeconds - penalty.seconds) } : d),
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: penalty.driverId, type: "penalty_cancelled", timestamp: nowIso(), metadata: { penaltyId: penalty.id } }],
      });
    }

    case "complete_race": {
      if (state.race.status !== "racing" && state.race.status !== "grid") return state;
      return touch({
        race: { ...state.race, status: "completed", updatedAt: nowIso() },
        events: [...state.events, { id: `ev_${Date.now()}`, raceId: state.race.id, driverId: null, type: "complete", timestamp: nowIso(), metadata: { resultsCount: state.drivers.filter((d) => d.status === "finished" || d.status === "dnf" || d.status === "dns" || d.status === "retired" || d.status === "withdrawn").length } }],
      });
    }

    default:
      return state;
  }
}

interface RaceContextValue {
  state: RaceState;
  setStatus: (status: RaceStatus) => void;
  startQualifying: () => void;
  startStopwatch: (driverId: string) => void;
  stopStopwatch: (driverId: string, elapsedMs: number) => void;
  confirmReplace: () => void;
  confirmClear: () => void;
  discardPending: () => void;
  requestClear: (driverId: string) => void;
  cancelPending: () => void;
  invalidateTime: (driverId: string) => void;
  restoreTime: (driverId: string) => void;
  manualCorrect: (driverId: string, elapsedMs: number) => void;
  setGridPosition: (driverId: string, position: number | null) => void;
  setGridPenalty: (driverId: string, seconds: number) => void;
  setKart: (driverId: string, kartNumber: number) => void;
  toggleReady: (driverId: string) => void;
  toggleConfirmed: (driverId: string) => void;
  setParticipants: (driverIds: string[]) => void;
  lockGrid: () => void;
  startRace: () => void;
  finishDriver: (driverId: string) => void;
  setDriverStatus: (driverId: string, status: RaceDriverStatus) => void;
  addPenalty: (driverId: string, seconds: number, reason: string) => void;
  cancelPenalty: (penaltyId: string) => void;
  completeRace: () => void;
  qualifyingList: RaceDriver[];
  gridRows: ReturnType<typeof computeGridRows>;
  results: ReturnType<typeof buildFinalResults>;
  pole: number | null;
}

const RaceContext = createContext<RaceContextValue | null>(null);

export function RaceProvider({ race, drivers, penalties, events, children }: { race: Race; drivers: RaceDriver[]; penalties: RacePenalty[]; events: RaceEvent[]; children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ race, drivers, penalties, events, activeStopwatch: null, pending: null, finishCounter: 1 }));

  const api = useMemo<RaceContextValue>(() => ({
    state,
    setStatus: (status) => dispatch({ type: "set_status", status }),
    startQualifying: () => dispatch({ type: "start_qualifying" }),
    startStopwatch: (driverId) => dispatch({ type: "start_stopwatch", driverId }),
    stopStopwatch: (driverId, elapsedMs) => dispatch({ type: "stop_stopwatch", driverId, elapsedMs }),
    confirmReplace: () => dispatch({ type: "resolve_pending", action: "confirm" }),
    confirmClear: () => dispatch({ type: "resolve_pending", action: "confirm" }),
    discardPending: () => dispatch({ type: "resolve_pending", action: "discard" }),
    requestClear: (driverId) => dispatch({ type: "request_clear", driverId }),
    cancelPending: () => dispatch({ type: "cancel_pending" }),
    invalidateTime: (driverId) => dispatch({ type: "invalidate_time", driverId }),
    restoreTime: (driverId) => dispatch({ type: "restore_time", driverId }),
    manualCorrect: (driverId, elapsedMs) => dispatch({ type: "manual_correct", driverId, elapsedMs }),
    setGridPosition: (driverId, position) => dispatch({ type: "set_grid_position", driverId, position }),
    setGridPenalty: (driverId, seconds) => dispatch({ type: "set_grid_penalty", driverId, seconds }),
    setKart: (driverId, kartNumber) => dispatch({ type: "set_kart", driverId, kartNumber }),
    toggleReady: (driverId) => dispatch({ type: "toggle_ready", driverId }),
    toggleConfirmed: (driverId) => dispatch({ type: "toggle_confirmed", driverId }),
    setParticipants: (driverIds) => dispatch({ type: "set_participants", driverIds }),
    lockGrid: () => dispatch({ type: "lock_grid" }),
    startRace: () => dispatch({ type: "start_race" }),
    finishDriver: (driverId) => dispatch({ type: "finish_driver", driverId }),
    setDriverStatus: (driverId, status) => dispatch({ type: "set_driver_status", driverId, status }),
    addPenalty: (driverId, seconds, reason) => dispatch({ type: "add_penalty", driverId, seconds, reason }),
    cancelPenalty: (penaltyId) => dispatch({ type: "cancel_penalty", penaltyId }),
    completeRace: () => dispatch({ type: "complete_race" }),
    qualifyingList: qualifyingRows(state.drivers),
    gridRows: computeGridRows(state.drivers),
    results: buildFinalResults(state.drivers),
    pole: poleTime(state.drivers),
  }), [state]);

  return <RaceContext.Provider value={api}>{children}</RaceContext.Provider>;
}

export function useRace() {
  const ctx = useContext(RaceContext);
  if (!ctx) throw new Error("useRace must be used within a RaceProvider");
  return ctx;
}

export function useDriver(driverId: string) {
  const { state } = useRace();
  return state.drivers.find((d) => d.driverId === driverId);
}