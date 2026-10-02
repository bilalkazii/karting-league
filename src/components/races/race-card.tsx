import Link from "next/link";
import { CalendarDays, ChevronRight, Clock, MapPin, Timer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RaceStatusBadge } from "@/components/races/race-status-badge";
import { formatDateTime } from "@/lib/race-utils";
import type { Race, RaceFormat } from "@/types/race";

const formatLabels: Record<RaceFormat, string> = { sprint: "Sprint", feature: "Feature", custom: "Custom" };

export function RaceCard({ race, driverCount }: { race: Race; driverCount: number }) {
  const enabled = race.status !== "cancelled";
  const classes = "group relative block overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 transition hover:border-[var(--red)]/40 hover:bg-[#11171b]";
  if (!enabled) {
    return <div className={classes + " opacity-60"}>
      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><Badge className="border-white/10 bg-white/5 text-lg font-bold text-white">{race.name.slice(0, 1)}</Badge><div><p className="text-sm font-bold">{race.name}</p><p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{formatLabels[race.format]}</p></div></div><RaceStatusBadge status={race.status} /></div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[var(--muted)]"><span className="flex items-center gap-1.5"><MapPin size={12} className="text-[var(--red-bright)]" />{race.venueName}</span><span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-[var(--red-bright)]" />{formatDateTime(race.date, race.startTime)}</span><span className="flex items-center gap-1.5"><Users size={12} className="text-[var(--red-bright)]" />{driverCount} drivers</span><span className="flex items-center gap-1.5"><Timer size={12} className="text-[var(--red-bright)]" />{race.qualifyingLapCount} qualifying lap(s)</span></div>
    </div>;
  }
  return <Link href={`/races/${race.id}`} className={classes}>
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><Badge className="border-white/10 bg-white/5 text-lg font-bold text-white">{race.name.slice(0, 1)}</Badge><div><p className="text-sm font-bold">{race.name}</p><p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{formatLabels[race.format]}</p></div></div><div className="flex items-center gap-2"><RaceStatusBadge status={race.status} /><ChevronRight size={15} className="text-[var(--muted)] transition group-hover:text-[var(--red-bright)]" /></div></div>
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[var(--muted)]"><span className="flex items-center gap-1.5"><MapPin size={12} className="text-[var(--red-bright)]" />{race.venueName}</span><span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-[var(--red-bright)]" />{formatDateTime(race.date, race.startTime)}</span><span className="flex items-center gap-1.5"><Users size={12} className="text-[var(--red-bright)]" />{driverCount} drivers</span><span className="flex items-center gap-1.5"><Clock size={12} className="text-[var(--red-bright)]" />{race.qualifyingLapCount} lap qualifying</span></div>
  </Link>;
}