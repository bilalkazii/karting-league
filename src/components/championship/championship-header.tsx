import { CalendarDays, Crown, Users } from "lucide-react";
import { SeasonStatusBadge } from "@/components/championship/season-status-badge";
import type { SeasonStatus } from "@/types/championship";

export interface ChampionshipHeaderProps {
  seasonName: string;
  status: SeasonStatus;
  groupName?: string | null;
  startDate?: string;
  endDate?: string;
  leaderName?: string | null;
  leaderPoints?: number;
  leaderGap?: number;
  completedRaces: number;
  totalRaces: number;
}

export function ChampionshipHeader({ seasonName, status, groupName, startDate, endDate, leaderName, leaderPoints, leaderGap, completedRaces, totalRaces }: ChampionshipHeaderProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="relative h-32 overflow-hidden bg-[#16100e] sm:h-36">
        <div className="absolute inset-0 carbon" />
        <div className="absolute -right-14 -top-24 size-64 rounded-full bg-[var(--red)]/15 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] to-transparent" />
      </div>
      <div className="relative -mt-12 px-5 pb-5 sm:px-7">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-xl border border-[var(--red)]/30 bg-[var(--red)]/10 text-lg font-black text-[var(--red-bright)] ring-4 ring-[var(--panel)]">{seasonName.slice(0, 1)}</span>
          <div className="min-w-0 pb-0.5">
            <div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-xl font-black tracking-[-.04em] sm:text-2xl">{seasonName}</h1><SeasonStatusBadge status={status} /></div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">{groupName && <span className="flex items-center gap-1.5"><Users size={12} className="text-[var(--red-bright)]" />{groupName}</span>}{startDate && endDate && <span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-[var(--red-bright)]" />{startDate} → {endDate}</span>}<span className="flex items-center gap-1.5"><span className="font-mono font-semibold text-white">{completedRaces}</span> of {totalRaces} races run</span></div>
            {leaderName && leaderPoints !== undefined && (
              <p className="mt-2 flex items-center gap-2 text-sm"><Crown size={14} className="text-[var(--amber)]" /><span className="text-[11px] uppercase tracking-widest text-[var(--muted)]">Current leader</span><span className="font-semibold">{leaderName}</span><span className="font-mono text-xs">{leaderPoints} pts</span>{leaderGap !== undefined && leaderGap > 0 && <span className="text-[11px] text-[var(--muted)]">leads by {leaderGap} pts</span>}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}