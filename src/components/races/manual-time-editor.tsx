"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRace } from "@/components/races/race-provider";
import { formatLapTime, parseLapTime } from "@/lib/race-utils";

export function ManualTimeEditor({ driverId }: { driverId: string }) {
  const { state, manualCorrect } = useRace();
  const [input, setInput] = useState("");
  const [confirming, setConfirming] = useState(false);
  const driver = state.drivers.find((d) => d.driverId === driverId);
  const existing = driver && (driver.qualifyingTimeMs !== null && (driver.qualifyingStatus === "completed" || driver.qualifyingStatus === "manually_corrected")) ? driver.qualifyingTimeMs : null;
  const parsed = parseLapTime(input);

  const handleSave = () => {
    if (parsed !== null && parsed > 0) {
      if (existing !== null && !confirming) { setConfirming(true); return; }
      manualCorrect(driverId, parsed);
      setInput("");
    }
  };

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[#0c1114] p-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[var(--muted)]"><Keyboard size={12} className="text-[var(--red-bright)]" />Manual time entry</div>
      {existing !== null && <p className="mt-2 text-[11px] text-[var(--muted)]">Current official time: <span className="font-semibold text-white">{formatLapTime(existing)}</span></p>}
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => { setInput(e.target.value); setConfirming(false); }} placeholder="42.310" inputMode="decimal" aria-label="Lap time" className="w-32 rounded-lg border border-[var(--line)] bg-white/[.03] px-3 py-2 font-mono text-sm text-white placeholder:text-[var(--muted)] outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]" />
        <Button size="sm" onClick={handleSave} disabled={parsed === null} className={confirming ? "bg-[var(--amber)] text-black hover:bg-[var(--amber)]" : ""}>{confirming ? `Overwrite?` : "Save time"}</Button>
      </div>
      {parsed !== null && <p className="mt-2 text-[10px] text-[var(--muted)]">Parsed as <span className="font-mono font-semibold text-[var(--green)]">{formatLapTime(parsed)}</span></p>}
      {confirming && <p className="mt-2 text-[10px] text-[var(--amber)]">Confirming will replace the existing official time.</p>}
    </div>
  );
}