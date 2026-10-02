"use client";

import { useEffect, useRef, useState } from "react";
import { Square, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRace } from "@/components/races/race-provider";
import { formatStopwatchMs } from "@/lib/race-utils";

export function QualifyingTimer({ driverId }: { driverId: string }) {
  const { state, stopStopwatch } = useRace();
  const isActive = state.activeStopwatch === driverId;
  const [running, setRunning] = useState(isActive);
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const tick = (frame: number) => {
      if (startRef.current !== null) setElapsedMs(frame - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [running, driverId]);

  const handleStop = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const final = performance.now() - (startRef.current ?? performance.now());
    startRef.current = null;
    setRunning(false);
    setElapsedMs(0);
    stopStopwatch(driverId, Math.max(0, Math.round(final)));
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--line)] bg-[#0c1114] p-5">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[var(--muted)]"><TimerReset size={12} className="text-[var(--red-bright)]" />Manual stopwatch</div>
      <div className={`font-mono text-4xl font-black tabular-nums tracking-tight ${isActive ? "text-[var(--red-bright)]" : "text-white"}`}>{formatStopwatchMs(elapsedMs)}</div>
      <div className="flex gap-2">
        {isActive ? (
          <Button size="sm" variant="secondary" onClick={handleStop}><Square size={12} />Stop lap</Button>
        ) : (
          <Button size="sm" disabled><TimerReset size={12} />Idle</Button>
        )}
      </div>
      {isActive && <p className="text-center text-[10px] text-[var(--amber)]">Green light — tap Stop lap when the kart crosses the line.</p>}
      {!isActive && <p className="text-center text-[10px] text-[var(--muted)]">Select a driver from the field and time their lap.</p>}
    </div>
  );
}