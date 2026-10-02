"use client";

import { Ban, CheckCircle2, CircleUserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverAvatar } from "@/components/driver-avatar";
import { DemoNotice } from "@/components/races/demo-notice";
import { RaceEventList } from "@/components/races/race-event-list";
import { useRace, useDriver } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";

export default function RaceLobbyPage() {
  const { state } = useRace();
  const readyCount = state.drivers.filter((d) => d.confirmed && d.ready).length;

  return <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
    <div className="space-y-6">
      <DemoNotice />
      <Card><CardHeader><CardTitle>Race lobby</CardTitle><p className="text-xs text-[var(--muted)]">{state.drivers.length} drivers · {readyCount} ready</p></CardHeader><CardContent className="p-0">
        <div className="divide-y divide-[var(--line)]">{state.drivers.map((d) => <LobbyRow key={d.driverId} driverId={d.driverId} />)}</div>
      </CardContent></Card>
    </div>
    <Card className="h-fit"><CardHeader><CardTitle>Session log</CardTitle></CardHeader><CardContent><RaceEventList limit={10} /></CardContent></Card>
  </div>;
}

function LobbyRow({ driverId }: { driverId: string }) {
  const driver = useDriver(driverId);
  const { toggleConfirmed, toggleReady } = useRace();
  const person = getDriverById(driverId);
  if (!driver || !person) return null;

  const declined = driver.status === "declined";
  const statusBadge = declined ? "border-white/10 bg-white/5 text-[var(--muted)] line-through" : driver.confirmed ? (driver.ready ? "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]" : "border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]") : "border-white/10 bg-white/5 text-[var(--muted)]";

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3">
      <DriverAvatar color={person.avatarColor} textColor={person.avatarTextColor} initials={person.nickname} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold">{person.name}{driver.ready && <CheckCircle2 size={13} className="shrink-0 text-[var(--green)]" />}</p>
        <p className="text-[10px] text-[var(--muted)]">Kart #{driver.kartNumber || person.racingNumber}</p>
      </div>
      <Badge className={statusBadge}>{driver.status}</Badge>
      <div className="flex gap-1.5">
        {!declined && <>
          <Button size="sm" variant={driver.confirmed ? "secondary" : "ghost"} onClick={() => toggleConfirmed(driverId)}>{driver.confirmed ? <Ban size={12} /> : <CircleUserRound size={12} />}{driver.confirmed ? "Unconfirm" : "Confirm"}</Button>
          <Button size="sm" variant={driver.ready ? "secondary" : "ghost"} disabled={!driver.confirmed} onClick={() => toggleReady(driverId)}>{driver.ready ? "Not ready" : "Ready"}</Button>
        </>}
      </div>
    </div>
  );
}