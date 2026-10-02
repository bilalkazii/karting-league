"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/races/demo-notice";
import { RaceActions } from "@/components/races/race-actions";
import { RaceControlDriverRow } from "@/components/races/race-control-driver-row";
import { RaceEventList } from "@/components/races/race-event-list";
import { useRace } from "@/components/races/race-provider";
import { getDriverById } from "@/lib/mock-data";

export default function RaceControlPage() {
  const { state } = useRace();
  const racers = state.drivers.filter((d) => d.status === "racing" || d.status === "ready" || d.status === "confirmed").sort((a, b) => (a.gridPosition ?? 99) - (b.gridPosition ?? 99));

  return <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
    <div className="space-y-6">
      <DemoNotice text="Race timing is operated manually. Penalties are listed separately and never auto-adjust finishing results." />
      <RaceActions />
      <Card><CardHeader><CardTitle>Live race control</CardTitle><p className="text-xs text-[var(--muted)]">{racers.length} cars on track</p></CardHeader><CardContent className="space-y-2">{racers.length === 0 ? <p className="text-xs text-[var(--muted)]">Grid not started yet — use Grid to lock positions, then start the race.</p> : racers.map((d) => <RaceControlDriverRow key={d.driverId} driverId={d.driverId} />)}</CardContent></Card>
      <PenaltyManager />
    </div>
    <Card className="h-fit"><CardHeader><CardTitle>Session log</CardTitle></CardHeader><CardContent><RaceEventList limit={12} /></CardContent></Card>
  </div>;
}

function PenaltyManager() {
  const { state, addPenalty, cancelPenalty } = useRace();
  const [driverId, setDriverId] = useState("");
  const [seconds, setSeconds] = useState(5);
  const [reason, setReason] = useState("");
  const active = state.penalties.filter((p) => p.status !== "cancelled");
  const drivers = state.drivers.filter((d) => d.confirmed);

  const submit = () => { if (!driverId || seconds <= 0 || !reason.trim()) return; addPenalty(driverId, seconds, reason.trim()); setReason(""); setSeconds(5); };

  return (
    <Card>
      <CardHeader><CardTitle>Penalties</CardTitle><p className="text-xs text-[var(--muted)]">Displayed separately — they never move finishing positions.</p></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-[var(--line)] bg-white/[.02] p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_5rem_1fr]">
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full rounded-lg border border-[var(--line)] bg-[#0b1013] px-3 py-2 text-xs text-white outline-none focus:border-[var(--red)]"><option value="">Driver…</option>{drivers.map((d) => { const person = getDriverById(d.driverId); return <option key={d.driverId} value={d.driverId}>{person?.name}</option>; })}</select>
            <input type="number" min={1} max={99} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] px-3 py-2 text-center font-mono text-xs text-white outline-none focus:border-[var(--red)]" aria-label="Penalty seconds" />
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. contact at turn 3)" className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] px-3 py-2 text-xs text-white placeholder:text-[var(--muted)] outline-none focus:border-[var(--red)]" />
          </div>
          <Button size="sm" onClick={submit} disabled={!driverId || seconds <= 0 || !reason.trim()} className="mt-2"><Flag size={12} />Issue penalty</Button>
        </div>
        {active.length === 0 ? <p className="text-xs text-[var(--muted)]">No active penalties.</p> : (
          <div className="divide-y divide-[var(--line)]">{active.map((p) => { const person = getDriverById(p.driverId); return <div key={p.id} className="flex items-center gap-3 py-2"><Badge className="border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]">+{p.seconds}s</Badge><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{person?.name}</p><p className="truncate text-[10px] text-[var(--muted)]">{p.reason}</p></div><button onClick={() => cancelPenalty(p.id)} className="text-[var(--muted)] hover:text-white" aria-label="Cancel penalty"><X size={13} /></button></div>; })}</div>
        )}
      </CardContent>
    </Card>
  );
}