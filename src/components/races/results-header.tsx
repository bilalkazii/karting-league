import { CalendarDays, MapPin, Users, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RaceStatusBadge } from "@/components/races/race-status-badge";
import { formatDateTime } from "@/lib/race-utils";
import type { RaceFormat, RaceStatus } from "@/types/race";

const formatLabels: Record<RaceFormat, string> = { sprint: "Sprint", feature: "Feature", custom: "Custom" };

export interface ResultsHeaderProps {
  raceName: string;
  raceStatus: RaceStatus;
  format: RaceFormat;
  groupName?: string | null;
  venueName: string;
  date: string;
  startTime: string;
  driverCount: number;
  organizerName?: string | null;
}

export function ResultsHeader({ raceName, raceStatus, format, groupName, venueName, date, startTime, driverCount, organizerName }: ResultsHeaderProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="relative h-28 overflow-hidden bg-[#16100e] sm:h-32">
        <div className="absolute inset-0 carbon" />
        <div className="absolute -right-14 -top-24 size-64 rounded-full bg-[var(--red)]/15 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] to-transparent" />
      </div>
      <div className="relative -mt-10 px-5 pb-5 sm:px-7">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-[var(--red)]/30 bg-[var(--red)]/10 text-lg font-black text-[var(--red-bright)] ring-4 ring-[var(--panel)]">{raceName.slice(0, 1)}</span>
          <div className="min-w-0 pb-0.5">
            <div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-xl font-black tracking-[-.04em] sm:text-2xl">{raceName}</h1><RaceStatusBadge status={raceStatus} /></div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]"><span className="flex items-center gap-1.5"><MapPin size={12} className="text-[var(--red-bright)]" />{venueName}</span><span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-[var(--red-bright)]" />{formatDateTime(date, startTime)}</span><span className="flex items-center gap-1.5"><Users size={12} className="text-[var(--red-bright)]" />{driverCount} drivers</span>{groupName && <span className="flex items-center gap-1.5"><Badge className="border-white/10 bg-white/5 text-[var(--muted)]">{groupName}</Badge></span>}<Badge className="border-white/10 bg-white/5 text-[var(--muted)]">{formatLabels[format]}</Badge></div>
            {organizerName && <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--muted)]"><UserRound size={11} className="text-[var(--red-bright)]" />Organized by {organizerName}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}