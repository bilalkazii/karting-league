"use client";

import { RotateCcw, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRace } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";
import { formatLapTime } from "@/lib/race-utils";

export function PendingOpDialog() {
  const { state, confirmReplace, confirmClear, discardPending } = useRace();
  const pending = state.pending;
  if (!pending) return null;

  const driver = getDriverById(pending.driverId);
  if (!driver) return null;

  if (pending.kind === "replace") {
    const current = state.drivers.find((d) => d.driverId === pending.driverId)?.qualifyingTimeMs;
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Replace qualifying time">
        <Card className="w-full max-w-sm border-[var(--amber)]/40 p-6">
          <div className="flex items-start justify-between gap-4">
            <div><h3 className="text-sm font-bold">Replace official time?</h3><p className="mt-1 text-xs text-[var(--muted)]">Stopwatch stopped for <span className="font-semibold text-white">{driver.name}</span>, who already has an official qualifying time.</p></div>
            <button onClick={discardPending} className="text-[var(--muted)] hover:text-white" aria-label="Cancel"><X size={16} /></button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[var(--line)] bg-white/[.03] p-3 text-center"><p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Current</p><p className="mt-1 text-lg font-black">{formatLapTime(current)}</p></div>
            <div className="rounded-lg border border-[var(--red)]/30 bg-[var(--red)]/5 p-3 text-center"><p className="text-[10px] uppercase tracking-widest text-[var(--red-bright)]">New lap</p><p className="mt-1 text-lg font-black text-[var(--red-bright)]">{formatLapTime(pending.elapsedMs)}</p></div>
          </div>
          <div className="mt-5 flex gap-2"><Button variant="ghost" size="sm" onClick={discardPending} className="flex-1">Discard</Button><Button size="sm" onClick={confirmReplace} className="flex-1"><Zap size={14} />Replace time</Button></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Clear qualifying time">
      <Card className="w-full max-w-sm border-[var(--amber)]/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <div><h3 className="text-sm font-bold">Clear qualifying time?</h3><p className="mt-1 text-xs text-[var(--muted)]">Remove the official lap for <span className="font-semibold text-white">{driver.name}</span>. This cannot be undone within this session.</p></div>
          <button onClick={discardPending} className="text-[var(--muted)] hover:text-white" aria-label="Cancel"><X size={16} /></button>
        </div>
        <div className="mt-5 flex gap-2"><Button variant="ghost" size="sm" onClick={discardPending} className="flex-1">Keep</Button><Button variant="secondary" size="sm" onClick={confirmClear} className="flex-1"><RotateCcw size={14} />Clear time</Button></div>
      </Card>
    </div>
  );
}