"use client";

import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RaceStatusBadge } from "@/components/races/race-status-badge";
import { useRace } from "@/components/races/race-provider";
import type { RaceFormat } from "@/types/race";

const formatLabels: Record<RaceFormat, string> = { sprint: "Sprint", feature: "Feature", custom: "Custom" };

export function RaceHeader() {
  const { state } = useRace();
  const race = state.race;
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="relative h-32 overflow-hidden bg-[#16100e] sm:h-36">
        <div className="absolute inset-0 carbon" />
        <div className="absolute -right-14 -top-24 size-64 rounded-full bg-[var(--red)]/15 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] to-transparent" />
      </div>
      <div className="relative -mt-12 px-5 pb-5 sm:px-7">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-xl border border-[var(--red)]/30 bg-[var(--red)]/10 text-lg font-black text-[var(--red-bright)] ring-4 ring-[var(--panel)]">{race.name.slice(0, 1)}</span>
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-xl font-black tracking-[-.04em] sm:text-2xl">{race.name}</h1><RaceStatusBadge status={race.status} /></div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]"><span className="flex items-center gap-1.5"><MapPin size={12} className="text-[var(--red-bright)]" />{race.venueName}</span><span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-[var(--red-bright)]" />{race.date}</span><span className="flex items-center gap-1.5"><Clock size={12} className="text-[var(--red-bright)]" />{race.startTime}</span><span className="flex items-center gap-1.5"><Users size={12} className="text-[var(--red-bright)]" />{state.drivers.length} drivers</span><Badge className="border-white/10 bg-white/5 text-[var(--muted)]">{formatLabels[race.format]}</Badge></div>
          </div>
        </div>
        {race.rules && <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">{race.rules}</p>}
      </div>
    </div>
  );
}