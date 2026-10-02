"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Search, UserPlus, UserX, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberCard } from "@/components/member-card";
import { EmptyState } from "@/components/empty-state";
import { InvitePanel } from "@/components/invite-panel";
import { Button } from "@/components/ui/button";
import { getGroupById, getGroupMembers, getDriverById, CURRENT_USER_ID } from "@/lib/mock-data";
import type { GroupRole } from "@/types/group";

const roleFilters: { value: GroupRole | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "admin", label: "Admins" },
  { value: "organizer", label: "Organizers" },
  { value: "member", label: "Members" },
];

export default function GroupMembersPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<GroupRole | "all">("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [blocked, setBlocked] = useState<string[]>([]);

  const group = getGroupById(groupId);
  if (!group) return <EmptyState title="Group not found" description="This group does not exist." />;

  const members = getGroupMembers(groupId);
  const currentUserMember = members.find((m) => m.driverId === CURRENT_USER_ID);
  const isOrganizer = currentUserMember?.role === "admin" || currentUserMember?.role === "organizer";

  const visibleMembers = members.filter((m) => !blocked.includes(m.driverId));
  const filtered = visibleMembers.filter((m) => {
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (search) {
      const driver = getDriverById(m.driverId);
      if (driver && !driver.name.toLowerCase().includes(search.toLowerCase()) && !driver.nickname.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  function handleRemove(driverId: string) {
    setBlocked((prev) => [...prev, driverId]);
  }

  return <div className="space-y-6 pb-10">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--muted)]">{visibleMembers.length} drivers in this group</p>
      <Button size="sm" onClick={() => setInviteOpen(true)}><UserPlus size={13} />Invite driver</Button>
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative max-w-sm flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input type="text" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-[var(--muted)] outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]" aria-label="Search members" />
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label="Filter by role">
        {roleFilters.map((f) => <button key={f.value} role="radio" aria-checked={roleFilter === f.value} onClick={() => setRoleFilter(f.value)} className={cn("rounded-lg px-3 py-1.5 text-[10px] font-semibold transition", roleFilter === f.value ? "bg-[var(--red)]/10 text-[var(--red-bright)] ring-1 ring-[var(--red)]/20" : "text-[var(--muted)] hover:bg-white/5")}>{f.label}</button>)}
      </div>
    </div>

    {filtered.length === 0 ? <EmptyState title="No members found" description="Try a different search or filter." /> : <div className="space-y-2">{filtered.map((m) => {
      const canRemove = isOrganizer && m.driverId !== CURRENT_USER_ID;
      const actions = canRemove ? <div className="flex items-center gap-1">
        <button onClick={() => handleRemove(m.driverId)} className="grid size-8 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--red)]/40 hover:text-[var(--red-bright)]" title={`Remove ${m.driverId}`} aria-label={`Remove driver ${m.driverId}`}><UserX size={14} /></button>
        <button onClick={() => handleRemove(m.driverId)} className="grid size-8 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--red)]/40 hover:text-[var(--red-bright)]" title={`Block ${m.driverId}`} aria-label={`Block driver ${m.driverId}`}><ShieldOff size={14} /></button>
      </div> : undefined;
      return <MemberCard key={m.driverId} member={m} actions={actions} />;
    })}</div>}

    <p className="text-[10px] text-[var(--muted)]">Remove and block actions are visible to admins and organizers. These updates affect local state only until backend integration.</p>

    <InvitePanel open={inviteOpen} onClose={() => setInviteOpen(false)} />
  </div>;
}