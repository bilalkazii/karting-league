"use client";

import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DriverAvatar } from "@/components/driver-avatar";
import { useRace } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";
import { raceDriverLabel } from "@/lib/race-utils";
import type { RaceDriverStatus } from "@/types/race";

const statusStyle: Record<RaceDriverStatus, string> = {
  finished: "border-[var(--green)]/30 bg-[var(--green)]/10 text-[var(--green)]",
  dnf: "border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red-bright)]",
  dns: "border-white/10 bg-white/5 text-[var(--muted)]",
  retired: "border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]",
  withdrawn: "border-white/10 bg-white/5 text-[var(--muted)] line-through",
  racing: "border-[var(--red)]/50 bg-[var(--red)]/15 text-[var(--red-bright)] animate-pulse",
  ready: "border-white/10 bg-white/5 text-[var(--muted)]",
  confirmed: "border-white/10 bg-white/5 text-[var(--muted)]",
  invited: "border-white/10 bg-white/5 text-[var(--muted)]",
  declined: "border-white/10 bg-white/5 text-[var(--muted)]",
};

export function RaceControlDriverRow({ driverId }: { driverId: string }) {
  const { state, setDriverStatus, addPenalty } = useRace();
  const driver = state.drivers.find((d) => d.driverId === driverId);
  const person = getDriverById(driverId);
  if (!driver || !person) return null;
  const racing = driver.status === "racing" || driver.status === "ready";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <DriverAvatar color={person.avatarColor} textColor={person.avatarTextColor} initials={person.nickname} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{person.name}</p>
          <p className="text-[10px] text-[var(--muted)]">Kart #{driver.kartNumber || person.racingNumber} · Grid {driver.gridPosition ?? "—"}</p>
        </div>
        <Badge className={statusStyle[driver.status]}>{raceDriverLabel(driver.status)}{driver.finishPosition ? ` · P${driver.finishPosition}` : ""}</Badge>
      </div>
      {racing && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" onClick={() => setDriverStatus(driverId, "finished")} className="bg-[var(--green)] text-black hover:bg-[var(--green)]"><Flag size={13} />Finished</Button>
          <Button size="sm" variant="secondary" onClick={() => setDriverStatus(driverId, "dnf")}>DNF</Button>
          <Button size="sm" variant="ghost" onClick={() => setDriverStatus(driverId, "dns")}>DNS</Button>
          <Button size="sm" variant="ghost" onClick={() => setDriverStatus(driverId, "retired")}>Retired</Button>
          <Button size="sm" variant="ghost" onClick={() => setDriverStatus(driverId, "withdrawn")}>Withdrawn</Button>
        </div>
      )}
      {!racing && <button onClick={() => addPenalty(driverId, 5, "Manual flag judge decision")} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--red-bright)] hover:bg-[var(--red)]/10"><Flag size={12} />+5s</button>}
    </div>
  );
}