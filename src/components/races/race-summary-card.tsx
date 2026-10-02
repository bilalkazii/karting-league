import Link from "next/link";
import { CalendarDays, ChevronRight, Flag, MapPin, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RaceStatusBadge } from "@/components/races/race-status-badge";
import { formatDateTime } from "@/lib/race-utils";
import type { RaceStatus } from "@/types/race";

export interface RaceSummaryCardProps {
  raceName: string;
  venueName: string;
  date: string;
  startTime: string;
  status: RaceStatus;
  winnerName?: string | null;
  poleName?: string | null;
  href?: string;
}

export function RaceSummaryCard({ raceName, venueName, date, startTime, status, winnerName, poleName, href }: RaceSummaryCardProps) {
  const body = (
    <div className="flex flex-row items-start justify-between gap-4 p-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2"><RaceStatusBadge status={status} /></div>
        <h3 className="mt-2 truncate text-sm font-bold">{raceName}</h3>
        <p className="mt-0.5 text-[10px] text-[var(--muted)]">{venueName} · {formatDateTime(date, startTime)}</p>
        <div className="mt-3 grid gap-1.5 text-[11px] text-[var(--muted)]">
          <p className="flex items-center gap-1.5"><Trophy size={11} className="text-[var(--red-bright)]" />Winner <span className="font-semibold text-white">{winnerName ?? "—"}</span></p>
          <p className="flex items-center gap-1.5"><Flag size={11} className="text-[var(--red-bright)]" />Pole <span className="font-semibold text-white">{poleName ?? "—"}</span></p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 text-right text-[10px] text-[var(--muted)]"><span className="flex items-center gap-1"><MapPin size={10} />{venueName}</span><span className="flex items-center gap-1"><CalendarDays size={10} />{formatDateTime(date, startTime)}</span></div>
    </div>
  );

  if (!href) return <Card>{body}</Card>;
  return <Card className="group transition hover:border-[var(--red)]/40 hover:bg-[#11171b]"><Link href={href} className="block">{body}</Link><div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3"><span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">View results</span><ChevronRight size={14} className="text-[var(--muted)] transition group-hover:text-[var(--red-bright)]" /></div></Card>;
}