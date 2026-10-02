import { StandingTrend } from "@/components/championship/standing-trend";
import { cn } from "@/lib/utils";
import type { StandingTrend as StandingTrendType } from "@/types/championship";

export interface RowMark {
  initials: string;
  color: string;
  textColor: string;
}

export interface StandingRowData {
  position: number;
  name: string;
  meta?: string;
  mark?: RowMark | null;
  points: number;
  pointsGap: number;
  wins: number;
  podiums: number;
  poles: number;
  racesEntered: number;
  dnfs: number;
  penalties: number;
  previousPosition: number | null;
  trend: StandingTrendType;
}

export const driverRowGrid = "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem_auto] md:grid-cols-[2.5rem_minmax(0,1.6fr)_6rem_4.5rem_3.5rem_3.5rem_3.5rem_3.5rem_auto] lg:grid-cols-[2.5rem_minmax(0,1.6fr)_6rem_4.5rem_3.5rem_3.5rem_3.5rem_3.5rem_3.5rem_3.5rem_auto]";

export const teamRowGrid = "grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-2 sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem_auto] md:grid-cols-[2.5rem_minmax(0,1.6fr)_6rem_4.5rem_3.5rem_3.5rem_3.5rem_3.5rem_auto]";

export const positionBadge = (pos: number) => (pos === 1 ? "bg-[var(--red)] text-white" : pos <= 3 ? "bg-[var(--amber)]/20 text-[var(--amber)]" : "bg-white/5 text-[var(--muted)]");

export interface StandingRowProps {
  kind: "driver" | "team";
  row: StandingRowData;
}

export function StandingRow({ kind, row }: StandingRowProps) {
  const grid = kind === "driver" ? driverRowGrid : teamRowGrid;
  return (
    <div className={cn("items-center px-3 py-3 sm:px-4", grid)}>
      <span className={cn("grid size-8 place-items-center rounded-md text-sm font-black", positionBadge(row.position))}>{row.position}</span>
      <div className="flex min-w-0 items-center gap-2.5">
        {row.mark ? <span className="grid size-8 shrink-0 place-items-center rounded-full text-[9px] font-black" style={{ backgroundColor: row.mark.color, color: row.mark.textColor }}>{row.mark.initials}</span> : <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/5 text-[9px] font-black text-[var(--muted)]">—</span>}
        <div className="min-w-0"><p className="truncate text-sm font-semibold">{kind === "driver" && row.position === 1 ? <span className="mr-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--red-bright)]">Leader</span> : null}{row.name}</p><p className="truncate text-[10px] text-[var(--muted)]">{row.meta ?? "—"}</p></div>
      </div>
      <span className="text-right font-mono text-sm font-bold text-white">{row.points} <span className="text-[9px] font-medium uppercase text-[var(--muted)]">pts</span></span>
      <span className="hidden text-right font-mono text-[11px] text-[var(--muted)] md:block">{row.position === 1 ? "—" : row.pointsGap > 0 ? `-${row.pointsGap}` : row.pointsGap < 0 ? `+${Math.abs(row.pointsGap)}` : "0"}</span>
      <span className="hidden text-right font-mono text-xs text-[var(--muted)] md:block">{row.wins}</span>
      <span className="hidden text-right font-mono text-xs text-[var(--muted)] md:block">{row.podiums}</span>
      <span className="hidden text-right font-mono text-xs text-[var(--muted)] md:block">{row.poles}</span>
      <span className="hidden text-right font-mono text-xs text-[var(--muted)] md:block">{row.racesEntered}</span>
      {kind === "driver" && <span className="hidden text-right font-mono text-xs text-[var(--muted)] lg:block">{row.dnfs}</span>}
      {kind === "driver" && <span className="hidden text-right font-mono text-xs text-[var(--muted)] lg:block">{row.penalties}</span>}
      <span className="hidden text-right sm:block"><StandingTrend trend={row.trend} previousPosition={row.previousPosition} /></span>
    </div>
  );
}