import { EmptyChampionshipState } from "@/components/championship/empty-championship-state";
import { StandingRow, driverRowGrid, teamRowGrid, type StandingRowData } from "@/components/championship/standing-row";
import { cn } from "@/lib/utils";

export interface StandingsTableProps {
  kind: "driver" | "team";
  rows: StandingRowData[];
  title?: string;
}

export function StandingsTable({ kind, rows, title }: StandingsTableProps) {
  const grid = kind === "driver" ? driverRowGrid : teamRowGrid;
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]" aria-label={title ?? (kind === "driver" ? "Driver standings" : "Team standings")}>
      {title && <p className="border-b border-[var(--line)] px-4 py-3 text-[11px] font-bold uppercase tracking-[.18em] text-[var(--muted)]">{title}</p>}
      <div className={cn("items-center gap-2 border-b border-[var(--line)] px-3 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)] sm:px-4", grid)}>
        <span>Pos</span>
        <span className="text-left">Driver</span>
        <span className="text-right">Points</span>
        <span className="hidden text-right md:block">Gap</span>
        <span className="hidden text-right md:block">Wins</span>
        <span className="hidden text-right md:block">Podiums</span>
        <span className="hidden text-right md:block">Poles</span>
        <span className="hidden text-right md:block">Races</span>
        {kind === "driver" && <span className="hidden text-right lg:block">DNF</span>}
        {kind === "driver" && <span className="hidden text-right lg:block">Penalties</span>}
        <span className="hidden text-right sm:block">Trend</span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {rows.length === 0 ? <div className="p-5"><EmptyChampionshipState variant="no_standings" /></div> : rows.map((row) => <StandingRow key={row.name} kind={kind} row={row} />)}
      </div>
      {rows.length > 0 && <p className="border-t border-[var(--line)] px-4 py-2.5 text-[10px] leading-relaxed text-[var(--muted)]">Position 1 is the current leader. Points are computed from recorded race results; penalties are listed separately.</p>}
    </div>
  );
}