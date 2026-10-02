"use client";

import { useRace } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";
import type { RaceEventType } from "@/types/race";

const typeLabel: Record<RaceEventType, string> = {
  qualifying_start: "Qualifying session started",
  qualifying_stop: "Qualifying lap recorded",
  qualifying_invalid: "Qualifying lap invalidated",
  qualifying_restore: "Qualifying lap restored",
  qualifying_reset: "Qualifying time cleared",
  qualifying_corrected: "Qualifying time manually corrected",
  qualifying_replace: "Official qualifying time replaced",
  qualifying_promoted: "Qualifying time promoted",
  ready: "Marked ready",
  not_ready: "Marked not ready",
  race_start: "Race started",
  race_finish: "Finished the race",
  dnf: "Did not finish",
  dns: "Did not start",
  retired: "Retired",
  withdrawn: "Withdrawn",
  penalty: "Penalty issued",
  penalty_cancelled: "Penalty cancelled",
  grid_change: "Grid position changed",
  grid_penalty: "Grid penalty applied",
  complete: "Race completed",
  note: "Note recorded",
  status_change: "Status changed",
};

export function RaceEventList({ limit }: { limit?: number }) {
  const { state } = useRace();
  const events = [...state.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
  if (events.length === 0) return <p className="text-xs text-[var(--muted)]">No events recorded yet in this session.</p>;
  return (
    <ol className="space-y-0">
      {events.map((e, i) => {
        const driver = e.driverId ? getDriverById(e.driverId) : null;
        return <li key={e.id} className={`relative flex items-baseline gap-3 py-2 ${i < events.length - 1 ? "border-b border-[var(--line)]/60" : ""}`}>
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--red)]/70" />
          <p className="min-w-0 flex-1 truncate text-xs"><span className="font-semibold text-white">{driver ? driver.name : "Session"}</span> <span className="text-[var(--muted)]">· {typeLabel[e.type]}</span></p>
          <time className="shrink-0 font-mono text-[10px] text-[var(--muted)]">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
        </li>;
      })}
    </ol>
  );
}