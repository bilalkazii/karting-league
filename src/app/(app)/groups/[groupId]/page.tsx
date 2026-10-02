import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronRight, MapPin, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamCard } from "@/components/team-card";
import { DriverAvatar } from "@/components/driver-avatar";
import { AvailabilityCard } from "@/components/availability-card";
import { getGroupById } from "@/lib/repositories/groups";
import { getGroupMembers } from "@/lib/repositories/members";
import { getTeamsByGroup } from "@/lib/repositories/teams";
import { getDriversByIds } from "@/lib/repositories/drivers";

export default async function GroupOverviewPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = await getGroupById(groupId);
  if (!group) notFound();

  const members = await getGroupMembers(groupId);
  const teams = await getTeamsByGroup(groupId);
  const goalIds = [
    ...members.filter((m) => m.role === "admin").map((m) => m.driverId),
    ...(group.currentChampionship ? [group.currentChampionship.leaderId] : []),
    ...group.recentResults.map((r) => r.winnerId),
  ];
  const driversById = new Map((await getDriversByIds(goalIds)).map((d) => [d.id, d]));
  const admins = members.filter((m) => m.role === "admin").map((m) => driversById.get(m.driverId));

  return <div className="space-y-6 pb-10">
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        {group.upcomingRace && <Card className="carbon relative overflow-hidden border-[var(--red)]/30">
          <div className="absolute -right-10 -top-16 size-56 rounded-full bg-[var(--red)]/10 blur-3xl" />
          <CardContent className="relative p-5">
            <div className="flex flex-wrap items-center gap-2"><Badge className="border-[var(--red)]/40 bg-[var(--red)]/10 text-[var(--red-bright)]">Next race</Badge></div>
            <h3 className="mt-3 text-2xl font-black tracking-[-.03em]">{group.upcomingRace.name}</h3>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]"><span className="flex items-center gap-1"><MapPin size={12} className="text-[var(--red-bright)]" />{group.upcomingRace.venue}</span><span className="flex items-center gap-1"><CalendarDays size={12} className="text-[var(--red-bright)]" />{group.upcomingRace.date}</span><span className="flex items-center gap-1"><Users size={12} className="text-[var(--red-bright)]" />{group.upcomingRace.driverCount} drivers</span></div>
            <Link href="/races" className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--red)] px-3.5 text-xs font-bold text-white hover:bg-[var(--red-bright)]">View race lobby <ArrowUpRight size={14} /></Link>
          </CardContent>
        </Card>}

        <Card><CardHeader><CardTitle>Admins</CardTitle></CardHeader><CardContent className="space-y-2">{admins.map((d) => d ? <div key={d.id} className="flex items-center gap-3 rounded-lg px-2 py-2"><DriverAvatar color={d.avatarColor} textColor={d.avatarTextColor} initials={d.nickname} size="sm" /><div><p className="text-sm font-semibold">{d.name}</p><p className="text-[10px] text-[var(--muted)]">{d.nickname} · #{d.racingNumber}</p></div><Badge className="ml-auto border-[var(--red)]/30 bg-[var(--red)]/10 text-[var(--red-bright)]">admin</Badge></div> : null)}</CardContent></Card>
      </div>

      <div className="space-y-5">
        <AvailabilityCard />

        {group.currentChampionship && (() => {
          const leader = driversById.get(group.currentChampionship!.leaderId);
          return <Card><CardHeader><CardTitle>Championship</CardTitle><Link href="/championship" className="text-xs font-semibold text-[var(--red-bright)]">View</Link></CardHeader><CardContent><p className="text-sm font-bold">{group.currentChampionship!.name}</p><p className="mt-1 text-xs text-[var(--muted)]">Round {group.currentChampionship!.round} of {group.currentChampionship!.totalRounds}</p>{leader && <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-[var(--line)] bg-white/[.02] p-3"><DriverAvatar color={leader.avatarColor} textColor={leader.avatarTextColor} initials={leader.nickname} size="sm" /><div><p className="text-xs text-[var(--muted)]">Championship leader</p><p className="text-sm font-bold">{leader.name}</p></div></div>}</CardContent></Card>;
        })()}

        {group.recentResults.length > 0 && <Card><CardHeader><CardTitle>Recent results</CardTitle><Link href="/races" className="text-xs font-semibold text-[var(--red-bright)]">View all</Link></CardHeader><CardContent className="space-y-2">{group.recentResults.map((r) => {
          const winner = driversById.get(r.winnerId);
          return <div key={r.name} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-white/[.03]"><span className="grid size-9 place-items-center rounded-lg bg-[var(--amber)]/10 text-[var(--amber)]"><Trophy size={15} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{r.name}</p><p className="text-[10px] text-[var(--muted)]">{r.date} · {r.venue}</p></div>{winner && <div className="flex items-center gap-1.5 text-xs"><DriverAvatar color={winner.avatarColor} textColor={winner.avatarTextColor} initials={winner.nickname} size="sm" /><span className="font-semibold">{winner.nickname}</span></div>}<ChevronRight size={14} className="text-[var(--muted)]" /></div>;
        })}</CardContent></Card>}
      </div>
    </div>

    {teams.length > 0 && <div><h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Teams</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div></div>}
  </div>;
}
