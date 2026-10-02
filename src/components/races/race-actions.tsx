"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ClipboardCheck, Flag, Grip, Play, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRace } from "@/components/races/race-provider";

export function RaceActions() {
  const { state, setStatus, startQualifying, lockGrid, startRace, completeRace } = useRace();
  const [confirmComplete, setConfirmComplete] = useState(false);
  const status = state.race.status;
  const readyCount = state.drivers.filter((d) => d.confirmed && d.ready).length;
  const confirmedCount = state.drivers.filter((d) => d.confirmed).length;

  let title = "Next step";
  let body: React.ReactNode = null;

  if (status === "draft") {
    title = "Draft race";
    body = <div className="space-y-3"><p className="text-xs text-[var(--muted)]">Open the lobby to start inviting drivers and running the session flow.</p><Button className="w-full" onClick={() => setStatus("lobby")}><Play size={14} />Open the lobby</Button></div>;
  } else if (status === "lobby") {
    title = "Lobby open";
    body = <div className="space-y-3"><p className="text-xs text-[var(--muted)]">{confirmedCount} of {state.drivers.length} drivers confirmed. Start the official qualifying window when everyone is signed in.</p><Button className="w-full" onClick={startQualifying}><Zap size={14} />Start qualifying</Button></div>;
  } else if (status === "qualifying") {
    title = "Qualifying in progress";
    body = <div className="space-y-3"><p className="text-xs text-[var(--muted)]">One official lap per driver. When times are set, lock the grid to bake in starting positions.</p><Button className="w-full" onClick={lockGrid}><Grip size={14} />Lock the grid</Button></div>;
  } else if (status === "grid") {
    title = "Grid is set";
    body = <div className="space-y-3"><p className="text-xs text-[var(--muted)]"><span className="font-semibold text-white">{readyCount}</span> driver{readyCount === 1 ? "" : "s"} ready. Confirm everyone is lined up, then drop the green.</p><Button className="w-full" onClick={startRace} disabled={readyCount === 0}><Flag size={14} />Start the race</Button>{readyCount === 0 && <p className="text-[10px] text-[var(--amber)]">Mark at least one driver ready before starting.</p>}</div>;
  } else if (status === "racing") {
    title = "Race is live";
    body = <div className="space-y-3"><p className="text-xs text-[var(--muted)]">Call finishes in the Control tab. Once every kart is accounted for, complete the race to finalize results.</p>{!confirmComplete ? <Button className="w-full" variant="secondary" onClick={() => setConfirmComplete(true)}><ClipboardCheck size={14} />Complete race…</Button> : <div className="space-y-2"><Button className="w-full bg-[var(--green)] text-black hover:bg-[var(--green)]" onClick={completeRace}><Check size={14} />Confirm complete</Button><Button className="w-full" variant="ghost" size="sm" onClick={() => setConfirmComplete(false)}><RotateCcw size={12} />Cancel</Button></div>}<p className="text-[10px] text-[var(--muted)]">Completing preserves DNF / DNS / retired / withdrawn statuses.</p></div>;
  } else if (status === "completed") {
    title = "Race complete";
    body = <div className="space-y-3"><p className="text-xs text-[var(--muted)]">Official results are ready. Penalties are listed separately and do not adjust finishing positions.</p><Link href={`/races/${state.race.id}/results`}><Button className="w-full" variant="secondary">View results</Button></Link></div>;
  }

  return (
    <Card className="border-[var(--red)]/30 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--red-bright)]">{title}</p>
      <div className="mt-3">{body}</div>
      <p className="mt-4 border-t border-[var(--line)] pt-3 text-[10px] leading-relaxed text-[var(--muted)]">Demo session — races, qualifying times, and results live in the browser and reset on reload.</p>
    </Card>
  );
}