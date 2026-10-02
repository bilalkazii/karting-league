import { notFound } from "next/navigation";
import { Award, BarChart3, Flag, Flame, Gauge, Medal, Shield, Target, Timer, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DriverAvatar } from "@/components/driver-avatar";
import { RatingBadge } from "@/components/rating-badge";
import { DriverStatCard } from "@/components/driver-stat-card";
import { getDriverById } from "@/lib/repositories/drivers";
import { getFormIcon, getFormColor } from "@/lib/mock-data";

export default async function DriverProfilePage({ params }: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await params;
  const driver = await getDriverById(driverId);
  if (!driver) notFound();

  const s = driver.stats;

  return <div className="space-y-8 pb-10">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
      <div className="flex items-center gap-4">
        <DriverAvatar color={driver.avatarColor} textColor={driver.avatarTextColor} initials={driver.nickname} size="xl" />
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-black tracking-[-.04em] sm:text-3xl">{driver.name}</h1><Badge className="font-mono">#{driver.racingNumber}</Badge></div>
          <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted)]"><span>{driver.nickname}</span><RatingBadge rating={driver.rating} /></div>
        </div>
      </div>
      <div className="flex gap-2 sm:ml-auto"><Button variant="secondary" disabled>Compare driver</Button><Button variant="secondary" disabled>Share profile</Button></div>
    </div>

    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      <DriverStatCard label="Total races" value={String(s.totalRaces)} icon={<Flag size={16} />} />
      <DriverStatCard label="Wins" value={String(s.wins)} accent detail={s.totalRaces > 0 ? `${Math.round((s.wins / s.totalRaces) * 100)}% win rate` : undefined} icon={<Medal size={16} />} />
      <DriverStatCard label="Podiums" value={String(s.podiums)} detail={s.totalRaces > 0 ? `${Math.round((s.podiums / s.totalRaces) * 100)}%` : undefined} icon={<Award size={16} />} />
      <DriverStatCard label="Pole positions" value={String(s.poles)} icon={<Target size={16} />} />
      <DriverStatCard label="Fastest laps" value={String(s.fastestLaps)} icon={<Zap size={16} />} />
      <DriverStatCard label="DNFs" value={String(s.dnfs)} detail={s.totalRaces > 0 ? `${Math.round((s.dnfs / s.totalRaces) * 100)}% DNF rate` : undefined} icon={<Gauge size={16} />} />
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <DriverStatCard label="Best lap" value={s.bestLap ? `${s.bestLap}s` : "—"} accent icon={<Timer size={16} />} />
      <DriverStatCard label="Avg qualifying" value={s.avgQualifying ? `${s.avgQualifying}s` : "—"} icon={<BarChart3 size={16} />} />
      <DriverStatCard label="Penalties" value={`${s.penaltySeconds}s`} detail={`${s.penalties} penalty calls`} icon={<Shield size={16} />} />
      <DriverStatCard label="Clean races" value={String(s.cleanRaces)} detail={s.totalRaces > 0 ? `${Math.round((s.cleanRaces / s.totalRaces) * 100)}% clean rate` : undefined} icon={<Flame size={16} />} />
    </div>

    <div className="grid gap-5 sm:grid-cols-2">
      <Card><CardHeader><CardTitle>Streaks</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="flex items-center justify-between"><span className="text-xs text-[var(--muted)]">Current win streak</span><span className="text-lg font-black">{s.winStreak}</span></div>
        <div className="flex items-center justify-between"><span className="text-xs text-[var(--muted)]">Current podium streak</span><span className="text-lg font-black">{s.podiumStreak}</span></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Recent form</CardTitle></CardHeader><CardContent><div className="flex gap-1.5">{driver.recentForm.map((f, i) => <span key={i} className={`grid size-9 place-items-center rounded-lg text-[10px] font-bold ${getFormColor(f)}`} title={f}>{getFormIcon(f)}</span>)}<span className="ml-2 grid size-9 place-items-center text-[10px] text-[var(--muted)]">← oldest</span></div></CardContent></Card>
    </div>

    {driver.badges.length > 0 && <Card><CardHeader><CardTitle>Badges</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{driver.badges.map((b) => <Badge key={b} className="border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)]">{b}</Badge>)}</div></CardContent></Card>}
  </div>;
}
