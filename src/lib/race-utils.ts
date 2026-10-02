import type { RaceDriver, RaceResult, RaceDriverStatus } from "@/types/race";

export interface GridRow {
  driverId: string;
  kartNumber: number;
  qualifyingTimeMs: number | null;
  qualifyingStatus: string;
  ready: boolean;
  originalPosition: number;
  gridPosition: number;
  gridPenaltySeconds: number;
}

export function formatLapTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms < 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.round(ms % 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return minutes > 0 ? `${minutes}:${pad(seconds)}.${pad(millis, 3)}` : `${seconds}.${pad(millis, 3)}`;
}

export function formatStopwatchMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.round(ms % 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${minutes > 0 ? `${minutes}:` : ""}${pad(seconds)}.${pad(millis, 3)}`;
}

export function formatPenaltySeconds(seconds: number): string {
  return `+${seconds}s`;
}

export function formatDateTime(date: string, time: string): string {
  return `${date} at ${time}`;
}

export function parseLapTime(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  if (s.includes(":")) {
    const [m, rest] = s.split(":", 2);
    const minutes = Number(m);
    if (!Number.isFinite(minutes)) return null;
    const [secRaw, msRaw] = rest.split(".");
    if (secRaw === undefined || msRaw === undefined) return null;
    const secs = Number(secRaw);
    const ms = Number(msRaw.padEnd(3, "0").slice(0, 3));
    if (!Number.isFinite(secs) || !Number.isFinite(ms)) return null;
    const total = minutes * 60000 + secs * 1000 + ms;
    return total > 0 ? total : null;
  }
  const parts = s.split(".");
  if (parts.length > 2) return null;
  const secs = Number(parts[0]);
  if (!Number.isFinite(secs)) return null;
  const ms = parts[1] ? Number(parts[1].padEnd(3, "0").slice(0, 3)) : 0;
  const total = secs * 1000 + ms;
  return total > 0 ? total : null;
}

export function isValidQualifyingTime(d: RaceDriver): boolean {
  return d.qualifyingTimeMs !== null && (d.qualifyingStatus === "completed" || d.qualifyingStatus === "manually_corrected");
}

export function qualifyingRows(drivers: RaceDriver[]): RaceDriver[] {
  const withTime = drivers
    .filter(isValidQualifyingTime)
    .sort((a, b) => (a.qualifyingTimeMs as number) - (b.qualifyingTimeMs as number));
  const invalid = drivers
    .filter((d) => d.qualifyingStatus === "invalid" && d.qualifyingTimeMs !== null)
    .sort((a, b) => (a.qualifyingTimeMs as number) - (b.qualifyingTimeMs as number));
  const noTime = drivers
    .filter((d) => d.qualifyingTimeMs === null)
    .sort((a, b) => (a.confirmed === b.confirmed ? 0 : a.confirmed ? -1 : 1));
  return [...withTime, ...invalid, ...noTime];
}

export function poleTime(drivers: RaceDriver[]): number | null {
  const valid = drivers.filter(isValidQualifyingTime);
  if (valid.length === 0) return null;
  return valid.reduce((min, d) => Math.min(min, d.qualifyingTimeMs as number), Infinity);
}

export function poleDiffMs(timeMs: number | null, pole: number | null): number | null {
  if (timeMs === null || pole === null) return null;
  return timeMs - pole;
}

export function computeGridRows(drivers: RaceDriver[]): GridRow[] {
  const base = qualifyingRows(drivers);
  const adjusted = [...base].sort((a, b) => {
    const ka = isValidQualifyingTime(a) ? (a.qualifyingTimeMs as number) + a.gridPenaltySeconds * 1000 : Infinity;
    const kb = isValidQualifyingTime(b) ? (b.qualifyingTimeMs as number) + b.gridPenaltySeconds * 1000 : Infinity;
    if (ka === kb) return 0;
    if (ka === Infinity) return 1;
    if (kb === Infinity) return -1;
    return ka - kb;
  });

  return base.map((d) => {
    const manual = d.gridPosition;
    const displayFromAdjusted = adjusted.findIndex((x) => x.driverId === d.driverId) + 1;
    return {
      driverId: d.driverId,
      kartNumber: d.kartNumber,
      qualifyingTimeMs: d.qualifyingTimeMs,
      qualifyingStatus: d.qualifyingStatus,
      ready: d.ready,
      originalPosition: base.findIndex((x) => x.driverId === d.driverId) + 1,
      gridPosition: manual ?? displayFromAdjusted,
      gridPenaltySeconds: d.gridPenaltySeconds,
    };
  });
}

export function buildFinalResults(drivers: RaceDriver[]): RaceResult[] {
  const rank: Record<RaceDriverStatus, number> = { finished: 0, dnf: 1, retired: 2, withdrawn: 3, dns: 4, racing: 5, ready: 5, confirmed: 5, invited: 5, declined: 5 };
  const rows = drivers
    .map((d) => ({ d, r: rank[d.status] ?? 9 }))
    .sort((a, b) => a.r - b.r || (a.d.finishPosition ?? 999) - (b.d.finishPosition ?? 999) || (a.d.gridPosition ?? 999) - (b.d.gridPosition ?? 999));

  let finishCounter = 1;
  const mapped = rows.map(({ d }) => {
    const isFinished = d.status === "finished";
    const pos = isFinished ? (d.finishPosition ?? finishCounter) : null;
    if (isFinished && d.finishPosition === null) finishCounter += 1;
    return { driverId: d.driverId, finishPosition: pos, status: d.status, qualifyingTimeMs: d.qualifyingTimeMs, penaltyTotalSeconds: d.penaltyTotalSeconds, notes: d.notes };
  });
  return mapped;
}

export function raceDriverLabel(status: RaceDriverStatus): string {
  switch (status) {
    case "invited": return "Invited";
    case "confirmed": return "Confirmed";
    case "declined": return "Declined";
    case "ready": return "Ready";
    case "racing": return "Racing";
    case "finished": return "Finished";
    case "dnf": return "DNF";
    case "dns": return "DNS";
    case "retired": return "Retired";
    case "withdrawn": return "Withdrawn";
    default: return status;
  }
}