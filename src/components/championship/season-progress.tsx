import { cn } from "@/lib/utils";

export interface SeasonProgressProps {
  completedRaces: number;
  totalRaces: number;
}

export function SeasonProgress({ completedRaces, totalRaces }: SeasonProgressProps) {
  const hasRaces = totalRaces > 0;
  const percent = hasRaces ? Math.min(100, Math.max(0, Math.round((completedRaces / totalRaces) * 100))) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Season progress</p>
        <p className="text-[10px] text-[var(--muted)]">{hasRaces ? `${completedRaces} of ${totalRaces} races completed` : "No races scheduled yet"}</p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={hasRaces ? `${percent}% complete` : "No scheduled races"}>
        <div className={cn("h-full rounded-full bg-[var(--red)] transition-all", !hasRaces && "bg-transparent")} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}