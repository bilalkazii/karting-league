import { ResultStatusBadge } from "@/components/races/result-status-badge";
import { DriverAvatar } from "@/components/driver-avatar";
import { formatLapTime, formatPenaltySeconds } from "@/lib/race-utils";
import { cn } from "@/lib/utils";
import type { RaceDriverStatus } from "@/types/race";
import type { Driver } from "@/types/driver";

export interface ResultPenalty {
  seconds: number;
  reason: string;
}

export interface ResultRowData {
  driver: Driver;
  teamName: string | null;
  position: number | null;
  status: RaceDriverStatus;
  kartNumber: number;
  gridPosition: number | null;
  qualifyingTimeMs: number | null;
  penalties: ResultPenalty[];
  notes: string;
}

export const resultPosColor = (pos: number | null) => (pos === null ? "bg-white/5 text-[var(--muted)]" : pos === 1 ? "bg-[var(--red)] text-white" : pos <= 3 ? "bg-[var(--amber)]/20 text-[var(--amber)]" : "bg-white/5 text-[var(--muted)]");

export function ResultRow({ row }: { row: ResultRowData }) {
  return (
    <div className="grid grid-cols-[2.5rem_3rem_1fr_auto] items-center gap-2 px-3 py-3 sm:grid-cols-[3rem_1fr_9rem_4.5rem_5rem_auto_auto_auto] sm:px-4">
      <span className={cn("grid size-8 place-items-center rounded-md text-sm font-black", resultPosColor(row.position))}>{row.position ?? "—"}</span>
      <DriverAvatar color={row.driver.avatarColor} textColor={row.driver.avatarTextColor} initials={row.driver.nickname} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{row.driver.name}</p>
        <p className="truncate text-[10px] text-[var(--muted)]">{row.driver.nickname}{row.teamName ? ` · ${row.teamName}` : ""}</p>
      </div>
      <div className="flex items-center justify-end gap-2"><ResultStatusBadge status={row.status} /></div>
      <span className="hidden truncate text-right font-mono text-xs text-[var(--muted)] sm:block">#{row.kartNumber || "—"}</span>
      <span className="hidden text-right font-mono text-xs text-[var(--muted)] sm:block">{row.gridPosition ? `P${row.gridPosition}` : "Quali —"}{row.qualifyingTimeMs ? ` · ${formatLapTime(row.qualifyingTimeMs)}` : ""}</span>
      <span className="hidden text-right sm:block">{row.penalties.length > 0 ? <span className="rounded-md border border-[var(--amber)]/30 bg-[var(--amber)]/10 px-2 py-0.5 font-mono text-[10px] text-[var(--amber)]" title={row.penalties.map((p) => p.reason).join(" · ")}>{row.penalties.map((p) => formatPenaltySeconds(p.seconds)).join(" + ")}</span> : <span className="text-[10px] text-[var(--muted)]">—</span>}</span>
      <span className="hidden max-w-44 truncate text-right text-[10px] text-[var(--muted)] sm:block" title={row.notes || undefined}>{row.notes || ""}</span>
    </div>
  );
}