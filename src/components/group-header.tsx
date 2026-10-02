import { CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Group } from "@/types/group";

export function GroupHeader({ group, memberCount }: { group: Group; memberCount: number }) {
  return <div className="overflow-hidden rounded-xl border border-[var(--line)]">
    <div className="relative h-36 sm:h-44" style={{ backgroundColor: group.coverColor }}>
      <div className="absolute inset-0 carbon" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] to-transparent" />
    </div>
    <div className="-mt-10 relative px-5 pb-5 sm:px-7">
      <div className="flex items-end gap-4">
        <span className="grid size-16 place-items-center rounded-xl text-lg font-black ring-4 ring-[var(--panel)] sm:size-20 sm:text-xl" style={{ backgroundColor: group.logoColor, color: group.logoTextColor }}>{group.logoInitials}</span>
        <div className="min-w-0 pb-1"><h1 className="truncate text-xl font-black tracking-[-.04em] sm:text-2xl">{group.name}</h1><div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]"><span className="flex items-center gap-1"><Users size={12} />{memberCount} members</span><span className="flex items-center gap-1"><CalendarDays size={12} />Created {group.createdAt}</span><Badge className="border-white/10 bg-white/5 text-[var(--muted)]">{group.privacy}</Badge></div></div>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">{group.description}</p>
    </div>
  </div>;
}
