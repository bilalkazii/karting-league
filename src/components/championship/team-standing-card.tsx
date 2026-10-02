import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StandingTrend, trendFromPositions } from "@/components/championship/standing-trend";
import type { TeamSeasonStats } from "@/types/championship";
import type { Team } from "@/types/team";

export interface TeamStandingCardProps {
  standing: TeamSeasonStats;
  team: Team;
  memberNames: string[];
  href?: string;
}

const statChip = (label: string, value: number) => <span className="rounded-md bg-white/5 px-2 py-0.5 text-right"><span className="block font-mono text-xs font-bold text-white">{value}</span><span className="block text-[8px] uppercase tracking-widest text-[var(--muted)]">{label}</span></span>;

export function TeamStandingCard({ standing, team, memberNames, href }: TeamStandingCardProps) {
  const trend = trendFromPositions(standing.position ?? 99, standing.previousPosition);
  const body = (
    <div className="p-5">
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg text-sm font-black ${standing.position === 1 ? "bg-[var(--red)] text-white" : standing.position && standing.position <= 3 ? "bg-[var(--amber)]/20 text-[var(--amber)]" : "bg-white/5 text-[var(--muted)]"}`}>P{standing.position ?? "—"}</span>
        <span className="grid size-10 shrink-0 place-items-center rounded-lg text-xs font-black" style={{ backgroundColor: team.logoColor, color: team.logoTextColor }}>{team.logoInitials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{team.name}</p>
          <p className="text-[10px] text-[var(--muted)]">{standing.drivers.length} drivers · {memberNames.join(", ")}</p>
          <p className="mt-1 font-mono text-xl font-black">{standing.points} <span className="text-[10px] font-medium uppercase text-[var(--muted)]">pts</span></p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]">{standing.position === 1 ? "Current leader" : standing.pointsGap !== null ? standing.pointsGap > 0 ? `Gap -${standing.pointsGap}` : "Level with leader" : "Gap —"}</p>
        </div>
        <StandingTrend trend={trend} previousPosition={standing.previousPosition} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {statChip("Wins", standing.wins)}
        {statChip("Podiums", standing.podiums)}
        {statChip("Poles", standing.poles)}
        {statChip("Races", standing.racesEntered)}
      </div>
    </div>
  );
  if (!href) return <Card>{body}</Card>;
  return <Card className="group transition hover:border-[var(--red)]/40 hover:bg-[#11171b]"><Link href={href} className="block">{body}</Link><div className="border-t border-[var(--line)] px-5 py-2.5 text-right"><ChevronRight size={14} className="ml-auto text-[var(--muted)] transition group-hover:text-[var(--red-bright)]" /></div></Card>;
}