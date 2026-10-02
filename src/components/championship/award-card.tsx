import { Award, Flag, Medal, ShieldCheck, Star, TrendingUp, Trophy, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AwardType } from "@/types/championship";

export interface AwardMark {
  initials: string;
  color: string;
  textColor: string;
}

export interface AwardCardProps {
  label: string;
  description?: string;
  type: AwardType;
  recipientName: string | null;
  value: string | null;
  recipMark?: AwardMark | null;
  demo?: boolean;
}

const awardIcons: Record<AwardType, React.ComponentType<{ size?: number | string; className?: string }>> = {
  winner: Trophy,
  podium: Medal,
  pole: Flag,
  driver_of_race: Star,
  most_improved: TrendingUp,
  cleanest_driver: ShieldCheck,
  championship_winner: Trophy,
  team_champion: Trophy,
  most_wins: Trophy,
  most_poles: Flag,
  most_podiums: Medal,
  cleanest_season: ShieldCheck,
  participation: Users,
};

export function AwardCard({ label, description, type, recipientName, value, recipMark, demo }: AwardCardProps) {
  const Icon = awardIcons[type] ?? Award;
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--red)]/10 text-[var(--red-bright)]"><Icon size={16} /></span>
        {demo && <span className="rounded-full border border-[var(--amber)]/30 bg-[var(--amber)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.14em] text-[var(--amber)]">Demo</span>}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold">{label}</h3>
        {description && <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--muted)]">{description}</p>}
      </div>
      <div className="mt-auto flex items-center gap-2.5 border-t border-[var(--line)] pt-3">
        {recipMark ? <span className="grid size-7 shrink-0 place-items-center rounded-full text-[8px] font-black" style={{ backgroundColor: recipMark.color, color: recipMark.textColor }}>{recipMark.initials}</span> : <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/5 text-[8px] font-black text-[var(--muted)]">—</span>}
        <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{recipientName ?? "No recipient yet"}</p>{value && <p className="truncate font-mono text-[10px] text-[var(--muted)]">{value}</p>}</div>
      </div>
    </Card>
  );
}