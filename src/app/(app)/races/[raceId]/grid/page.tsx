"use client";

import { Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/races/demo-notice";
import { GridTable } from "@/components/races/grid-table";
import { RaceEventList } from "@/components/races/race-event-list";
import { useRace } from "@/components/races/race-provider";

export default function RaceGridPage() {
  const { state, lockGrid } = useRace();
  const status = state.race.status;
  const editable = status === "qualifying" || status === "grid" || status === "racing";
  const readOnly = status === "completed";

  return <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
    <div className="space-y-6">
      <DemoNotice text="Grid rows auto-sort by qualifying time plus grid penalties. Manual position overrides take precedence, but do not change the official qualifying order." />
      {status === "qualifying" && (
        <Card className="border-[var(--amber)]/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold">Ready to lock the grid?</p>
            <Button size="sm" onClick={lockGrid}><Grip size={14} />Lock the grid</Button>
          </div>
        </Card>
      )}
      <GridTable edit={editable} />
      {readOnly && <p className="text-xs text-[var(--muted)]">Grid is locked for this completed race.</p>}
    </div>
    <Card className="h-fit"><CardHeader><CardTitle>Session log</CardTitle></CardHeader><CardContent><RaceEventList limit={10} /></CardContent></Card>
  </div>;
}