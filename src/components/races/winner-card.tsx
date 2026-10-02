import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DriverAvatar } from "@/components/driver-avatar";
import { formatLapTime } from "@/lib/race-utils";
import type { Driver } from "@/types/driver";

export interface WinnerCardProps {
  driver: Driver;
  teamName?: string | null;
  finishPosition: number;
  kartNumber: number;
  qualifyingPosition: number | null;
  qualifyingTimeMs: number | null;
  notes?: string;
}

export function WinnerCard({ driver, teamName, finishPosition, kartNumber, qualifyingPosition, qualifyingTimeMs, notes }: WinnerCardProps) {
  return (
    <Card className="relative overflow-hidden border-[var(--red)]/40 p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--red)] via-[var(--red-bright)] to-[var(--red)]" />
      <div className="absolute -right-16 -top-16 size-52 rounded-full bg-[var(--red)]/15 blur-3xl" />
      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex flex-col items-center gap-2">
          <DriverAvatar color={driver.avatarColor} textColor={driver.avatarTextColor} initials={driver.nickname} size="xl" className="ring-2 ring-[var(--red)]/40 ring-offset-2 ring-offset-[var(--panel)]" />
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[.2em] text-[var(--red-bright)]"><Trophy size={12} />Race winner</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black tracking-[-.03em]">{driver.name}</h2>
          <p className="text-xs text-[var(--muted)]">{driver.nickname}{teamName ? ` · ${teamName}` : ""}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="rounded-lg bg-[var(--red)]/15 px-2.5 py-1 font-mono text-xs font-black text-[var(--red-bright)]">P{finishPosition}</span>
            <span className="rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs text-[var(--muted)]">Kart #{kartNumber}</span>
            <span className="rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs text-[var(--muted)]">Quali{qualifyingPosition ? ` P${qualifyingPosition}` : " —"}{qualifyingTimeMs ? ` · ${formatLapTime(qualifyingTimeMs)}` : ""}</span>
          </div>
          {notes && <p className="mt-3 text-xs text-[var(--muted)]">{notes}</p>}
        </div>
      </div>
    </Card>
  );
}