"use client";

import { Check, Minus, Timer, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DriverAvatar } from "@/components/driver-avatar";
import { useRace } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";
import { formatLapTime, formatPenaltySeconds, poleDiffMs } from "@/lib/race-utils";
import { cn } from "@/lib/utils";

export const posColor = (pos: number) => (pos === 1 ? "bg-[var(--red)] text-white" : pos <= 3 ? "bg-[var(--amber)]/20 text-[var(--amber)]" : "bg-white/5 text-[var(--muted)]");

export function GridTable({ edit = false }: { edit?: boolean }) {
  const { gridRows, pole, setGridPosition, setGridPenalty, toggleReady } = useRace();
  const rows = [...gridRows].sort((a, b) => a.gridPosition - b.gridPosition);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 border-b border-[var(--line)] px-4 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)] sm:grid-cols-[3rem_1fr_5rem_6rem_4.5rem_auto]">
        <span>Pos</span><span>Driver</span><span className="hidden text-center sm:block">Kart</span><span className="hidden text-right sm:block">Quali</span><span className="hidden text-right sm:block">Gap</span>{edit && <span className="text-right">Controls</span>}
      </div>
      <div className="divide-y divide-[var(--line)]">
        {rows.map((row, i) => {
          const driver = getDriverById(row.driverId);
          if (!driver) return null;
          const diff = poleDiffMs(row.qualifyingTimeMs, pole);
          const noTime = row.qualifyingTimeMs === null || row.qualifyingStatus === "not_started";
          return (
            <div key={row.driverId} className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 px-4 py-3 sm:grid-cols-[3rem_1fr_5rem_6rem_4.5rem_auto]">
              <div className="flex items-center gap-2">
                <span className={cn("grid size-7 place-items-center rounded-md text-xs font-black", posColor(row.gridPosition))}>{i === 0 ? <Trophy size={13} /> : row.gridPosition}</span>
                {edit && <input type="number" min={1} max={rows.length} value={row.gridPosition} onChange={(e) => setGridPosition(row.driverId, e.target.value ? Number(e.target.value) : null)} className="w-12 rounded-md border border-[var(--line)] bg-white/[.03] px-1.5 py-1 text-center font-mono text-xs outline-none focus:border-[var(--red)]" aria-label={`Grid position for ${driver.name}`} />}
              </div>
              <div className="flex min-w-0 items-center gap-2.5">
                <DriverAvatar color={driver.avatarColor} textColor={driver.avatarTextColor} initials={driver.nickname} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{driver.name}</p>
                  <p className="text-[10px] text-[var(--muted)]">{driver.nickname} · #{driver.racingNumber}</p>
                </div>
                {!edit && <Badge className={cn("ml-auto border-white/10", row.ready ? "bg-[var(--green)]/10 text-[var(--green)]" : "bg-white/5 text-[var(--muted)]")}>{row.ready ? <Check size={9} /> : <Minus size={9} />} {row.ready ? "ready" : "not ready"}</Badge>}
              </div>
              <span className="hidden text-center font-mono text-xs text-[var(--muted)] sm:block">#{row.kartNumber || "—"}</span>
              <span className="hidden text-right font-mono text-sm font-bold text-white sm:block">{noTime ? "—" : formatLapTime(row.qualifyingTimeMs)}</span>
              <span className="hidden text-right font-mono text-[11px] text-[var(--muted)] sm:block">{noTime ? "DNS" : diff === null ? "—" : `+${(diff / 1000).toFixed(3)}s`}</span>
              {edit ? (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <input type="number" min={0} max={99} step={1} value={row.gridPenaltySeconds} onChange={(e) => setGridPenalty(row.driverId, e.target.value ? Number(e.target.value) : 0)} className="w-16 rounded-md border border-[var(--line)] bg-white/[.03] px-2 py-1 text-right font-mono text-xs outline-none focus:border-[var(--red)]" aria-label={`Grid penalty for ${driver.name}`} />
                  <Button size="sm" variant={row.ready ? "secondary" : "ghost"} onClick={() => toggleReady(row.driverId)}>{row.ready ? "Mark not ready" : "Mark ready"}</Button>
                </div>
              ) : row.gridPenaltySeconds > 0 && <span className="text-right"><Badge className="border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]"><Timer size={9} />{formatPenaltySeconds(row.gridPenaltySeconds)} grid</Badge></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}