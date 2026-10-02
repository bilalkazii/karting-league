import { ResultRow, type ResultRowData } from "@/components/races/result-row";
import { Info } from "lucide-react";

export interface ResultsTableProps {
  rows: ResultRowData[];
  title?: string;
}

export function ResultsTable({ rows, title }: ResultsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]" aria-label={title ?? "Race results"}>
      {title && <p className="border-b border-[var(--line)] px-4 py-3 text-[11px] font-bold uppercase tracking-[.18em] text-[var(--muted)]">{title}</p>}
      <div className="grid grid-cols-[2.5rem_3rem_1fr_auto] items-center gap-2 border-b border-[var(--line)] px-3 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)] sm:grid-cols-[3rem_1fr_9rem_4.5rem_5rem_auto_auto_auto] sm:px-4">
        <span>Pos</span><span className="sm:hidden" /><span>Driver</span><span className="hidden sm:block">Team</span><span className="hidden text-center sm:block">Kart</span><span className="hidden text-right sm:block">Quali</span><span className="text-right">Status</span><span className="hidden text-right sm:block">Penalty</span><span className="hidden text-right sm:block">Notes</span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {rows.length === 0 ? <p className="px-5 py-8 text-center text-xs text-[var(--muted)]">No results recorded for this race yet.</p> : rows.map((row) => <ResultRow key={row.driver.id} row={row} />)}
      </div>
      <p className="flex items-start gap-1.5 border-t border-[var(--line)] px-4 py-2.5 text-[10px] leading-relaxed text-[var(--muted)]"><Info size={11} className="mt-0.5 shrink-0" />Penalties are shown separately and do not change finishing positions.</p>
    </div>
  );
}