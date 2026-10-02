import Link from "next/link";
import { CalendarDays, ChevronRight, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDriverById } from "@/lib/mock-data";
import type { Group } from "@/types/group";

export function GroupCard({ group, memberCount }: { group: Group; memberCount: number }) {
  const leader = group.currentChampionship ? getDriverById(group.currentChampionship.leaderId) : null;

  return <Link href={`/groups/${group.id}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] rounded-xl">
    <Card className="overflow-hidden transition hover:border-[var(--line)] hover:bg-[var(--panel-raised)]">
      <div className="relative h-28 sm:h-32" style={{ backgroundColor: group.coverColor }}>
        <div className="absolute inset-0 carbon" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-lg text-xs font-black" style={{ backgroundColor: group.logoColor, color: group.logoTextColor }}>{group.logoInitials}</span>
          <div><h3 className="text-sm font-bold leading-tight">{group.name}</h3><p className="text-[10px] text-white/60">{group.privacy === "private" ? "Private group" : "Public"}</p></div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="line-clamp-2 text-xs text-[var(--muted)]">{group.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--muted)]">
          <span className="flex items-center gap-1"><Users size={12} />{memberCount} members</span>
          {group.upcomingRace && <span className="flex items-center gap-1"><CalendarDays size={12} className="text-[var(--red-bright)]" />{group.upcomingRace.name}</span>}
        </div>
        {group.currentChampionship && <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-white/[.02] px-3 py-2"><span className="text-[10px] text-[var(--muted)]">{group.currentChampionship.name}</span>{leader && <Badge className="border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]">Leader: {leader.nickname}</Badge>}</div>}
        <div className="flex items-center justify-between pt-1 text-xs text-[var(--muted)] group-hover:text-white transition-colors"><span>View group</span><ChevronRight size={14} /></div>
      </div>
    </Card>
  </Link>;
}
