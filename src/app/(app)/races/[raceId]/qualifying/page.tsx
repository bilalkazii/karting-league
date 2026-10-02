"use client";

import { useState } from "react";
import { RotateCcw, StopCircle, Timer, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverAvatar } from "@/components/driver-avatar";
import { ManualTimeEditor } from "@/components/races/manual-time-editor";
import { PendingOpDialog } from "@/components/races/pending-op-dialog";
import { QualifyingTimer } from "@/components/races/qualifying-timer";
import { useRace } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";
import { formatLapTime, poleDiffMs } from "@/lib/race-utils";
import { cn } from "@/lib/utils";

export default function RaceQualifyingPage() {
  const { state, qualifyingList, pole, startStopwatch, invalidateTime, restoreTime, requestClear } = useRace();
  const [manualOpenFor, setManualOpenFor] = useState<string | null>(null);
  const canStartAny = state.activeStopwatch === null;
  const activeId = state.activeStopwatch ?? "";

  return <div className="grid gap-6 xl:grid-cols-[18rem_1fr]">
    <div className="space-y-4">
      <Card className="border-[var(--red)]/30">
        <CardHeader><CardTitle>Qualifying clock</CardTitle></CardHeader>
        <CardContent>
          <QualifyingTimer key={activeId || "idle"} driverId={activeId || ""} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Best lap</CardTitle></CardHeader>
        <CardContent>{pole ? <div><p className="font-mono text-3xl font-black tracking-tight text-[var(--red-bright)]">{formatLapTime(pole)}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{getDriverById(qualifyingList[0]?.driverId ?? "")?.name ?? "No time set"}</p></div> : <p className="text-xs text-[var(--muted)]">No official time yet.</p>}</CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader><CardTitle>Field & times</CardTitle><p className="text-xs text-[var(--muted)]">One official lap per driver. Starting a new lap requires the active lap to be stopped.</p></CardHeader>
      <CardContent className="space-y-2 p-0">
        <div className="px-5 pt-2">
          <ManualTimeEditor driverId={state.activeStopwatch ?? qualifyingList[0]?.driverId ?? ""} />
        </div>
        <div className="divide-y divide-[var(--line)]">
          {qualifyingList.map((d) => {
            const driver = getDriverById(d.driverId);
            if (!driver) return null;
            const diff = poleDiffMs(d.qualifyingTimeMs, pole);
            const active = state.activeStopwatch === d.driverId;
            const completed = d.qualifyingTimeMs !== null && (d.qualifyingStatus === "completed" || d.qualifyingStatus === "manually_corrected");
            const invalid = d.qualifyingStatus === "invalid";
            const noTime = d.qualifyingTimeMs === null;
            return (
              <div key={d.driverId} className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn("grid size-6 place-items-center rounded-md text-[11px] font-black", invalid ? "bg-white/5 text-[var(--muted)]" : "bg-white/5 text-white")}>{!noTime && !invalid ? qualifyingList.findIndex((x) => x.driverId === d.driverId) + 1 : "—"}</span>
                  <DriverAvatar color={driver.avatarColor} textColor={driver.avatarTextColor} initials={driver.nickname} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{driver.name}</p>
                    <p className="text-[10px] text-[var(--muted)]">Kart #{d.kartNumber || driver.racingNumber}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className={cn("text-lg font-black", invalid ? "text-[var(--muted)] line-through" : "text-white")}>{noTime ? "—" : formatLapTime(d.qualifyingTimeMs)}</p>
                    {!noTime && !invalid && diff !== null && <p className="text-[10px] text-[var(--muted)]">+{(diff / 1000).toFixed(3)}s</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {active ? (
                      <Badge className="animate-pulse border-[var(--red)]/50 bg-[var(--red)]/15 text-[var(--red-bright)]"><StopCircle size={9} />Timing now</Badge>
                    ) : (
                      <Button size="sm" variant={completed || invalid ? "secondary" : "primary"} disabled={!canStartAny} title={!canStartAny ? "Another stopwatch is active" : `Time ${driver.name}`} onClick={() => startStopwatch(d.driverId)}><Timer size={12} />{completed ? "Re-time" : "Time lap"}</Button>
                    )}
                    {completed && <Button size="sm" variant="ghost" onClick={() => invalidateTime(d.driverId)}>Invalidate</Button>}
                    {invalid && <Button size="sm" variant="ghost" onClick={() => restoreTime(d.driverId)}><Undo2 size={12} />Restore</Button>}
                    {d.qualifyingTimeMs !== null && <Button size="sm" variant="ghost" onClick={() => requestClear(d.driverId)}><RotateCcw size={12} />Clear</Button>}
                    {completed && <button onClick={() => setManualOpenFor(manualOpenFor === d.driverId ? null : d.driverId)} className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-white">{manualOpenFor === d.driverId ? "Close" : "Manual edit"}</button>}
                  </div>
                </div>
                {manualOpenFor === d.driverId && completed && <div className="mt-3"><ManualTimeEditor driverId={d.driverId} /></div>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    <PendingOpDialog />
  </div>;
}