import { Info, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ChampionshipScoring } from "@/types/championship";

export interface ScoringRulesCardProps {
  scoring: ChampionshipScoring;
}

export function ScoringRulesCard({ scoring }: ScoringRulesCardProps) {
  const positions = Object.keys(scoring.pointsByPosition)
    .map((p) => Number(p))
    .filter((p) => Number.isFinite(p))
    .sort((a, b) => a - b);
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2"><Settings2 size={14} className="text-[var(--red-bright)]" /><h2 className="text-sm font-bold">Scoring rules</h2></div>
      <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{scoring.mode === "automatic" ? "Automatic points" : "Custom points"}</p>
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Finish positions</p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {positions.length === 0 ? <p className="col-span-full text-xs text-[var(--muted)]">No position points configured.</p> : positions.map((pos) => (
              <div key={pos} className="rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2"><p className="text-[10px] text-[var(--muted)]">P{pos}</p><p className="font-mono text-sm font-bold">{scoring.pointsByPosition[pos]} pts</p></div>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 border-t border-[var(--line)] pt-3 text-xs">
          <p className="flex justify-between"><span className="text-[var(--muted)]">Pole position</span><span className="font-mono">{scoring.polePositionPoints} pts</span></p>
          <p className="flex justify-between"><span className="text-[var(--muted)]">Participation</span><span className="font-mono">{scoring.participationPoints} pts</span></p>
          {scoring.fastestLapPoints > 0 && <p className="flex justify-between"><span className="text-[var(--muted)]">Fastest lap</span><span className="font-mono">{scoring.fastestLapPoints} pts</span></p>}
          <p className="flex justify-between"><span className="text-[var(--muted)]">DNF</span><span className="font-mono">{scoring.dnfPoints} pts</span></p>
          <p className="flex justify-between"><span className="text-[var(--muted)]">DNS</span><span className="font-mono">{scoring.dnsPoints} pts</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${scoring.penaltyAdjustmentEnabled ? "bg-[var(--amber)]/10 text-[var(--amber)]" : "bg-white/5 text-[var(--muted)]"}`}>{scoring.penaltyAdjustmentEnabled ? "Penalty adjustment on" : "Penalty adjustment off"}</span>
        </div>
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--muted)]"><Info size={12} className="mt-0.5 shrink-0 text-[var(--red-bright)]" />{scoring.penaltyAdjustmentEnabled ? "When penalty adjustment is enabled, penalty seconds are factored in and finishing positions are recalculated." : "Penalties are recorded separately and do not change finishing positions or awarded points."}</p>
      </div>
    </Card>
  );
}