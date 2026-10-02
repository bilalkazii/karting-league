"use client";

import { useState } from "react";
import { Check, ChevronRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverAvatar } from "@/components/driver-avatar";
import { DemoNotice } from "@/components/races/demo-notice";
import { useRace } from "@/components/races/race-provider";
import { getDriverById, getGroupMembers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function RaceSetupPage() {
  const { state, setParticipants, setKart } = useRace();
  const race = state.race;
  const members = getGroupMembers(race.groupId);
  const [selected, setSelected] = useState<string[]>(state.race.participatingDriverIds.length ? state.race.participatingDriverIds : state.drivers.map((d) => d.driverId));

  const toggle = (driverId: string) => setSelected((prev) => prev.includes(driverId) ? prev.filter((id) => id !== driverId) : [...prev, driverId]);

  return <div className="space-y-6">
    <DemoNotice />
    <Card>
      <CardHeader><CardTitle>Choose the field</CardTitle><p className="text-xs text-[var(--muted)]">{selected.length} of {members.length} group members included</p></CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[var(--line)]">
          {members.map((m) => {
            const driver = getDriverById(m.driverId);
            if (!driver) return null;
            const included = selected.includes(m.driverId);
            const kart = state.drivers.find((d) => d.driverId === m.driverId)?.kartNumber ?? 0;
            return <div key={m.driverId} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <button onClick={() => toggle(m.driverId)} className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition", included ? "border-[var(--red)] bg-[var(--red)] text-white" : "border-[var(--line)] bg-white/[.03] text-transparent")} role="checkbox" aria-checked={included}><Check size={12} /></button>
              <DriverAvatar color={driver.avatarColor} textColor={driver.avatarTextColor} initials={driver.nickname} size="sm" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{driver.name}</p><p className="text-[10px] text-[var(--muted)]">{driver.nickname} · #{driver.racingNumber}</p></div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">
                <span>Kart</span>
                <input type="number" min={0} max={99} value={kart} disabled={!included} onChange={(e) => setKart(m.driverId, e.target.value ? Number(e.target.value) : 0)} className={cn("w-14 rounded-md border bg-white/[.03] px-2 py-1 text-center font-mono text-xs text-white outline-none focus:border-[var(--red)]", included ? "border-[var(--line)]" : "border-[var(--line)]/50 opacity-40")} aria-label={`Kart number for ${driver.name}`} />
              </div>
            </div>;
          })}
        </div>
      </CardContent>
    </Card>

    <div className="flex items-center justify-end">
      <Button onClick={() => setParticipants(selected)}><UserPlus size={14} />Apply to race field<ChevronRight size={14} /></Button>
    </div>
  </div>;
}