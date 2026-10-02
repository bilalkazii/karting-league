import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DriverAvatar } from "@/components/driver-avatar";
import { ResultStatusBadge } from "@/components/races/result-status-badge";
import type { RaceDriverStatus } from "@/types/race";
import type { Driver } from "@/types/driver";

export interface PodiumEntry {
  position: 1 | 2 | 3;
  driver: Driver;
  teamName?: string | null;
  kartNumber: number;
  qualifyingPosition: number | null;
  status: RaceDriverStatus;
}

const medalStyles: Record<number, string> = {
  1: "border-[var(--red)]/40 bg-[var(--red)]/10 text-[var(--red-bright)]",
  2: "border-white/10 bg-white/10 text-[var(--muted)]",
  3: "border-[var(--amber)]/40 bg-[var(--amber)]/10 text-[var(--amber)]",
};

export function PodiumCard({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => a.position - b.position);
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {sorted.map((entry) => (
        <Card key={entry.driver.id} className={cn("relative flex flex-col items-center gap-3 p-5 text-center", entry.position === 1 ? "border-[var(--red)]/40 sm:scale-[1.02]" : "")}>
          <span className={cn("grid size-9 place-items-center rounded-lg font-mono text-sm font-black", medalStyles[entry.position])}>P{entry.position}</span>
          <DriverAvatar color={entry.driver.avatarColor} textColor={entry.driver.avatarTextColor} initials={entry.driver.nickname} size={entry.position === 1 ? "xl" : "lg"} className={cn(entry.position === 1 && "ring-2 ring-[var(--red)]/40 ring-offset-2 ring-offset-[var(--panel)]")} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{entry.driver.name}</p>
            <p className="text-[10px] text-[var(--muted)]">{entry.driver.nickname}{entry.teamName ? ` · ${entry.teamName}` : ""}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">Kart #{entry.kartNumber}</span>
              <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">Quali{entry.qualifyingPosition ? ` P${entry.qualifyingPosition}` : " —"}</span>
              <ResultStatusBadge status={entry.status} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}