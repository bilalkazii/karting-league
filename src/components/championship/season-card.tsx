import Link from "next/link";
import { CalendarDays, ChevronRight, Crown, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SeasonStatusBadge } from "@/components/championship/season-status-badge";
import { SeasonProgress } from "@/components/championship/season-progress";
import type { Season } from "@/types/championship";

export interface SeasonCardProps {
  season: Season;
  groupName?: string | null;
  raceCount: number;
  completedRaceCount: number;
  leaderName?: string | null;
  leaderPoints?: number;
  href?: string;
}

export function SeasonCard({ season, groupName, raceCount, completedRaceCount, leaderName, leaderPoints, href }: SeasonCardProps) {
  const body = (
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><h3 className="truncate text-sm font-bold">{season.name}</h3><p className="mt-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">{groupName ?? "Group"}</p></div>
        <SeasonStatusBadge status={season.status} />
      </div>
      <div className="mt-4 space-y-2 text-[11px] text-[var(--muted)]">
        <p className="flex items-center gap-1.5"><CalendarDays size={11} className="text-[var(--red-bright)]" />{season.startDate} → {season.endDate}</p>
        {leaderName && leaderPoints !== undefined ? <p className="flex items-center gap-1.5"><Crown size={11} className="text-[var(--red-bright)]" />Leader <span className="font-semibold text-white">{leaderName}</span><span className="font-mono">· {leaderPoints} pts</span></p> : <p className="flex items-center gap-1.5"><Users size={11} className="text-[var(--red-bright)]" />No leader yet</p>}
      </div>
      <div className="mt-4"><SeasonProgress completedRaces={completedRaceCount} totalRaces={raceCount} /></div>
    </div>
  );

  if (!href) return <Card>{body}</Card>;
  return <Card className="group transition hover:border-[var(--red)]/40 hover:bg-[#11171b]"><Link href={href} className="block">{body}</Link><div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-2.5"><span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">View season</span><ChevronRight size={14} className="text-[var(--muted)] transition group-hover:text-[var(--red-bright)]" /></div></Card>;
}