import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/races/demo-notice";
import { ChampionshipHeader } from "@/components/championship/championship-header";
import { SeasonProgress } from "@/components/championship/season-progress";
import { ScoringRulesCard } from "@/components/championship/scoring-rules-card";
import { StandingsTable } from "@/components/championship/standings-table";
import { DriverStandingCard } from "@/components/championship/driver-standing-card";
import { TeamStandingCard } from "@/components/championship/team-standing-card";
import { AwardGrid } from "@/components/championship/award-grid";
import { EmptyChampionshipState } from "@/components/championship/empty-championship-state";
import {
  driverStandingRowData,
  teamStandingRowData,
} from "@/lib/championship-data";
import {
  getActiveSeasonForDriver,
  getSeasonStandings,
  getSeasonTeamStats,
  getSeasonAwards,
  getSeasonRaces,
  getSeasonRecords,
  resolveSeasonIdentities,
} from "@/lib/repositories/championship";
import { getCurrentDriverProfile } from "@/lib/supabase/profile";

export default async function ChampionshipPage() {
  const driver = await getCurrentDriverProfile();
  const season = driver ? await getActiveSeasonForDriver(driver.id) : null;

  if (!season) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="The long game" title="Championship" description="Season standings, points, and awards." />
        <EmptyChampionshipState variant="no_active_season" action={<Link href="/seasons/new"><Button><Plus size={14} />Create season</Button></Link>} />
      </div>
    );
  }

  const standings = await getSeasonStandings(season.id);
  const teamStats = await getSeasonTeamStats(season.id);
  const awards = await getSeasonAwards(season.id);
  const races = await getSeasonRaces(season.id);
  const records = await getSeasonRecords(season.id);

  const identities = await resolveSeasonIdentities(
    season,
    [
      ...standings.final.map((s) => s.driverId).filter((id): id is string => Boolean(id)),
      ...awards.flatMap((a) => (a.driverId ? [a.driverId] : [])),
      ...records.flatMap((r) => (r.driverId ? [r.driverId] : [])),
    ],
    [
      ...teamStats.map((t) => t.teamId),
      ...awards.flatMap((a) => (a.teamId ? [a.teamId] : [])),
    ],
  );

  const driverRows = driverStandingRowData(standings.final, (id) => identities.driverById.get(id) ?? null);
  const completedRaces = races.filter((r) => r.status === "completed").length;
  const group = identities.group;

  const leader = standings.final[0];
  const leaderDriver = leader?.driverId ? identities.driverById.get(leader.driverId) ?? null : null;

  const driverStandingCards = standings.final.slice(0, 4).map((s) => {
    const driver = s.driverId ? identities.driverById.get(s.driverId) ?? null : null;
    if (!driver) return null;
    return <DriverStandingCard key={s.driverId} standing={s} driver={driver} href={`/drivers/${driver.id}`} />;
  }).filter(Boolean);

  const teamStandingCards = teamStats.slice(0, 4).map((ts) => {
    const team = identities.teamById.get(ts.teamId);
    if (!team) return null;
    const members = identities.teamMemberNamesById.get(ts.teamId) ?? [];
    return <TeamStandingCard key={ts.teamId} standing={ts} team={team} memberNames={members} />;
  }).filter(Boolean);

  const awardItems = awards.map((a) => {
    const recipientName = a.driverId ? identities.driverById.get(a.driverId)?.name ?? null : a.teamId ? identities.teamById.get(a.teamId)?.name ?? null : null;
    const driver = a.driverId ? identities.driverById.get(a.driverId) ?? null : null;
    return {
      award: a,
      recipientName,
      recipMark: driver ? { initials: driver.nickname, color: driver.avatarColor, textColor: driver.avatarTextColor } : null,
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="The long game"
        title="Championship"
        description="Season standings, points, and awards."
        actions={<Link href="/seasons/new"><Button variant="secondary" size="sm"><Plus size={14} />New season</Button></Link>}
      />

      <DemoNotice />

      <ChampionshipHeader
        seasonName={season.name}
        status={season.status}
        groupName={group?.name ?? null}
        startDate={season.startDate}
        endDate={season.endDate}
        leaderName={leaderDriver?.name ?? null}
        leaderPoints={leader?.points}
        leaderGap={leader?.pointsGap}
        completedRaces={completedRaces}
        totalRaces={season.raceIds.length}
      />

      <SeasonProgress completedRaces={completedRaces} totalRaces={season.raceIds.length} />

      <div className="grid gap-6 lg:grid-cols-[1fr_28rem]">
        <div className="space-y-6">
          <StandingsTable kind="driver" rows={driverRows} title="Driver standings" />

          {teamStats.length > 0 && (
            <StandingsTable
              kind="team"
              rows={teamStandingRowData(teamStats, (id) => identities.teamById.get(id) ?? null)}
              title="Team standings"
            />
          )}

          {awardItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold">Season awards</h2>
              <AwardGrid items={awardItems} demo />
            </div>
          )}
        </div>

        <div className="space-y-6">
          {driverStandingCards.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold">Current leaders</h2>
              {driverStandingCards}
            </div>
          )}

          {teamStandingCards.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold">Team standings</h2>
              {teamStandingCards}
            </div>
          )}

          <ScoringRulesCard scoring={season.scoring} />

          {records.length > 0 && (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
              <h2 className="text-sm font-bold">Season records</h2>
              <div className="mt-3 space-y-2">
                {records.map((rec) => {
                  const recDriver = rec.driverId ? identities.driverById.get(rec.driverId) ?? null : null;
                  return (
                    <div key={rec.id} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-[var(--line)]/50 last:border-0">
                      <span className="text-xs">{rec.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold">{rec.value}</span>
                        {recDriver && <span className="text-[10px] text-[var(--muted)]">{recDriver.nickname}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Link href={`/seasons/${season.id}`} className="block rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 text-center text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--red)]/40 hover:text-white">
            View full season details →
          </Link>
        </div>
      </div>
    </div>
  );
}