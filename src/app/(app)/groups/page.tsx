"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { GroupCard } from "@/components/group-card";
import { EmptyState } from "@/components/empty-state";
import { InvitePanel } from "@/components/invite-panel";
import { getDriverGroups, getGroupMembers, CURRENT_USER_ID } from "@/lib/mock-data";

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const userGroups = getDriverGroups(CURRENT_USER_ID);
  const filtered = search ? userGroups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())) : userGroups;

  return <div className="space-y-8">
    <PageHeader eyebrow="The paddock" title="My groups" description="Your karting crews, race weekends, and championship battles." actions={<><Button variant="secondary" onClick={() => setInviteOpen(true)}><UserPlus size={14} />Join group</Button><Link href="/groups/new"><Button><Plus size={14} />Create group</Button></Link></>} />

    <div className="relative max-w-sm">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
      <input type="text" placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-[var(--line)] bg-white/[.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-[var(--muted)] outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)]" aria-label="Search groups" />
    </div>

    {filtered.length === 0 ? <EmptyState title="No groups found" description={search ? "Try a different search term." : "Create your first group to start organizing races with friends."} action={!search ? <Link href="/groups/new"><Button><Plus size={14} />Create group</Button></Link> : undefined} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((group) => <GroupCard key={group.id} group={group} memberCount={getGroupMembers(group.id).length} />)}</div>}

    <InvitePanel open={inviteOpen} onClose={() => setInviteOpen(false)} />
  </div>;
}
