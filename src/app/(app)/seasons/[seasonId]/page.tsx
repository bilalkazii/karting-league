import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/races/demo-notice";
import { ChampionshipHeader } from "@/components/championship/championship-header";
import { SeasonProgress } from "@/components/championship/season-progress";
import { ScoringRulesCard } from "@/components/championship/scoring-rules-card";
import { StandingsTable } from "@/components/championship/standings-table";
import { AwardGrid } from "@/components/championship/award-grid";
import { RaceSummaryCard } from "@/components/races/race-summary-card";
import {
  getSeasonById,
  getSeasonStandings,
  getSeasonTeamStats,
  getSeasonAwards,
  getSeasonRecords,
  getSeasonRaces,
  getSeasonRaceResults,
  resolveSeasonIdentities,
} from "@/lib/repositories/championship";
import { driverStandingRowData, teamStandingRowData } from "@/lib/championship-data";

export default async function SeasonDetailPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const season = await getSeasonById(seasonId);
  if (!season) notFound();

  const standings = await getSeasonStandings(season.id);
  const teamStats = await getSeasonTeamStats(season.id);
  const awards = await getSeasonAwards(season.id);
  const records = await getSeasonRecords(season.id);
  const races = await getSeasonRaces(season.id);
  const raceResults = await getSeasonRaceResults(season.id);

  const identities = await resolveSeasonIdentities(
    season,
    [
      ...standings.final.map((s) => s.driverId).filter((id): id is string => Boolean(id)),
      ...awards.flatMap((a) => (a.driverId ? [a.driverId] : [])),
      ...records.flatMap((r) => (r.driverId ? [r.driverId] : [])),
      ...raceResults.flatMap((rr) => [rr.winnerId, rr.poleDriverId]).filter((id): id is string => Boolean(id)),
    ],
    [
      ...teamStats.map((t) => t.teamId),
      ...awards.flatMap((a) => (a.teamId ? [a.teamId] : [])),
    ],
  );

  const completedRaces = races.filter((r) => r.status === "completed").length;
  const group = identities.group;

  const leader = standings.final[0];
  const leaderDriver = leader?.driverId ? identities.driverById.get(leader.driverId) ?? null : null;

  const driverRows = driverStandingRowData(standings.final, (id) => identities.driverById.get(id) ?? null);
  const teamRows = teamStandingRowData(teamStats, (id) => identities.teamById.get(id) ?? null);

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
      <div className="flex items-center gap-3">
        <Link href="/championship" className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--red)]/40 hover:text-white">
          <ArrowLeft size={16} />
        </Link>
        <PageHeader eyebrow="Season detail" title={season.name} description={`${season.startDate} → ${season.endDate}`} />
      </div>

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
          {driverRows.length > 0 && <StandingsTable kind="driver" rows={driverRows} title="Driver standings" />}
          {teamRows.length > 0 && <StandingsTable kind="team" rows={teamRows} title="Team standings" />}

          {raceResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold">Season races</h2>
              <div className="space-y-3">
                {raceResults.map((rr) => {
                  const winner = rr.winnerId ? identities.driverById.get(rr.winnerId) ?? null : null;
                  const pole = rr.poleDriverId ? identities.driverById.get(rr.poleDriverId) ?? null : null;
                  return (
                    <RaceSummaryCard
                      key={rr.race.id}
                      raceName={rr.race.name}
                      venueName={rr.race.venueName}
                      date={rr.race.date}
                      startTime={rr.race.startTime}
                      status={rr.race.status}
                      winnerName={winner?.name ?? null}
                      poleName={pole?.name ?? null}
                      href={`/races/${rr.race.id}/results`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {races.filter((r) => r.status !== "completed").length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold">Upcoming races</h2>
              <div className="space-y-3">
                {races.filter((r) => r.status !== "completed").map((race) => (
                  <RaceSummaryCard
                    key={race.id}
                    raceName={race.name}
                    venueName={race.venueName}
                    date={race.date}
                    startTime={race.startTime}
                    status={race.status}
                    href={`/races/${race.id}`}
                  />
                ))}
              </div>
            </div>
          )}

          {awardItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold">Season awards</h2>
              <AwardGrid items={awardItems} demo />
            </div>
          )}
        </div>

        <div className="space-y-6">
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

          {raceResults.length > 0 && (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
              <h2 className="text-sm font-bold">Season summary</h2>
              <div className="mt-3 space-y-2 text-[11px] text-[var(--muted)]">
                <p>{completedRaces} of {season.raceIds.length} races completed</p>
                <p>{raceResults.reduce((sum, rr) => sum + rr.summary.finishers, 0)} total finishers across {completedRaces} races</p>
                <p>{raceResults.reduce((sum, rr) => sum + rr.summary.penaltiesIssued, 0)} penalties issued</p>
                <p>{raceResults.reduce((sum, rr) => sum + rr.summary.totalPenaltySeconds, 0)} total penalty seconds</p>
              </div>
            </div>
          )}

          <Link href="/championship" className="block rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 text-center text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--red)]/40 hover:text-white">
            ← Back to championship
          </Link>
        </div>
      </div>
    </div>
  );
}