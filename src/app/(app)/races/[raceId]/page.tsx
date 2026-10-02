"use client";

import Link from "next/link";
import { Activity, CalendarDays, ClipboardList, Clock, Gauge, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DriverAvatar } from "@/components/driver-avatar";
import { RaceActions } from "@/components/races/race-actions";
import { RaceEventList } from "@/components/races/race-event-list";
import { useRace } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";
import type { RaceFormat } from "@/types/race";

const formatLabels: Record<RaceFormat, string> = { sprint: "Sprint", feature: "Feature", custom: "Custom" };

export default function RaceOverviewPage() {
  const { state } = useRace();
  const race = state.race;
  const organizer = getDriverById(race.organizerId);

  const confirmed = state.drivers.filter((d) => d.confirmed);
  const ready = state.drivers.filter((d) => d.ready);
  const timed = state.drivers.filter((d) => d.qualifyingTimeMs !== null);

  const facts: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: "Venue", value: race.venueName, icon: <MapPin size={13} className="text-[var(--red-bright)]" /> },
    { label: "Date", value: `${race.date} at ${race.startTime}`, icon: <CalendarDays size={13} className="text-[var(--red-bright)]" /> },
    { label: "Time", value: race.startTime, icon: <Clock size={13} className="text-[var(--red-bright)]" /> },
    { label: "Format", value: formatLabels[race.format], icon: <Gauge size={13} className="text-[var(--red-bright)]" /> },
    { label: "Qualifying", value: `${race.qualifyingLapCount} official lap(s)`, icon: <Activity size={13} className="text-[var(--red-bright)]" /> },
    { label: "Organizer", value: organizer ? organizer.name : "—", icon: <ClipboardList size={13} className="text-[var(--red-bright)]" /> },
  ];

  return <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
    <div className="space-y-6">
      <Card><CardHeader><CardTitle>Race details</CardTitle></CardHeader><CardContent>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{facts.map((f) => <div key={f.label} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-white/5">{f.icon}</span><div><p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{f.label}</p><p className="text-sm font-semibold">{f.value}</p></div></div>)}</div>
        {race.rules && <div className="mt-5 rounded-lg border border-[var(--line)] bg-white/[.02] p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Rules</p><p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{race.rules}</p></div>}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Field summary</CardTitle><Link href="/races" className="text-xs font-semibold text-[var(--red-bright)]">Races</Link></CardHeader><CardContent>
        <div className="flex flex-wrap gap-2"><Badge className="border-white/10 bg-white/5 text-white">{state.drivers.length} drivers</Badge><Badge className="border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]">{confirmed.length} confirmed</Badge><Badge className="border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]">{ready.length} ready</Badge><Badge className="border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red-bright)]">{timed.length} with a time</Badge></div>
        <div className="mt-4 flex flex-wrap gap-2">{state.drivers.map((d) => { const driver = getDriverById(d.driverId); return driver ? <div key={d.driverId} className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/[.02] py-1 pl-1 pr-3"><DriverAvatar color={driver.avatarColor} textColor={driver.avatarTextColor} initials={driver.nickname} size="sm" /><span className="text-xs font-semibold">{driver.name}</span></div> : null; })}</div>
      </CardContent></Card>
    </div>

    <div className="space-y-6">
      <RaceActions />
      <Card><CardHeader><CardTitle>Session log</CardTitle></CardHeader><CardContent><RaceEventList limit={8} /></CardContent></Card>
    </div>
  </div>;
}