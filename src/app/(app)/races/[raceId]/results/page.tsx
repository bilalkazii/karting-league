"use client";

import { Card } from "@/components/ui/card";
import { DemoNotice } from "@/components/races/demo-notice";
import { ResultsHeader } from "@/components/races/results-header";
import { WinnerCard } from "@/components/races/winner-card";
import { PodiumCard, type PodiumEntry } from "@/components/races/podium-card";
import { ResultsTable } from "@/components/races/results-table";
import type { ResultRowData } from "@/components/races/result-row";
import { RaceSummaryCard } from "@/components/races/race-summary-card";
import { RaceShareCard } from "@/components/share/race-share-card";
import { CopyShareTextButton } from "@/components/share/copy-share-text-button";
import { ExportCsvButton, type CsvColumn } from "@/components/share/export-csv-button";
import { useRace } from "@/components/races/race-provider";
import { getDriverById, getGroupById } from "@/lib/mock-data";
import { teamByDriver, getRaceResultSummary } from "@/lib/championship-data";
import { racePoleDriverId } from "@/lib/championship-utils";
import { formatLapTime } from "@/lib/race-utils";

const csvCols: CsvColumn[] = [
  { key: "pos", label: "Position" },
  { key: "name", label: "Driver" },
  { key: "team", label: "Team" },
  { key: "status", label: "Status" },
  { key: "kart", label: "Kart" },
  { key: "quali", label: "Qualifying" },
  { key: "penalty", label: "Penalty" },
  { key: "notes", label: "Notes" },
];

function shareText(raceName: string, winnerName: string | null, podium: PodiumEntry[]): string {
  const lines = [`${raceName}`, winnerName ? `Winner: ${winnerName}` : ""];
  for (const e of podium) lines.push(`P${e.position}: ${e.driver.name}`);
  return lines.filter(Boolean).join("\n");
}

export default function RaceResultsPage() {
  const { state, results } = useRace();
  const race = state.race;
  const group = getGroupById(race.groupId);
  const organizer = getDriverById(race.organizerId);
  const activePenalties = state.penalties.filter((p) => p.status !== "cancelled");
  const summary = getRaceResultSummary(race.id);
  const poleId = racePoleDriverId(state.drivers);
  const poleDriver = poleId ? getDriverById(poleId) : null;

  const sorted = [...results].sort((a, b) => (a.finishPosition ?? 999) - (b.finishPosition ?? 999));
  const winnerRow = sorted.find((r) => r.finishPosition === 1 && r.status === "finished");
  const winnerDriver = winnerRow ? getDriverById(winnerRow.driverId) : null;
  const winnerRd = winnerRow ? state.drivers.find((d) => d.driverId === winnerRow.driverId) : null;

  const podiumEntries: PodiumEntry[] = sorted
    .filter((r) => r.finishPosition !== null && r.finishPosition >= 1 && r.finishPosition <= 3 && r.status === "finished")
    .slice(0, 3)
    .map((r) => {
      const driver = getDriverById(r.driverId)!;
      const rd = state.drivers.find((d) => d.driverId === r.driverId);
      return {
        position: r.finishPosition as 1 | 2 | 3,
        driver,
        teamName: teamByDriver(r.driverId),
        kartNumber: rd?.kartNumber ?? 0,
        qualifyingPosition: rd?.gridPosition ?? null,
        status: r.status,
      };
    });

  const tableRows: ResultRowData[] = sorted.map((r) => {
    const driver = getDriverById(r.driverId)!;
    const rd = state.drivers.find((d) => d.driverId === r.driverId);
    return {
      driver,
      teamName: teamByDriver(r.driverId),
      position: r.finishPosition,
      status: r.status,
      kartNumber: rd?.kartNumber ?? 0,
      gridPosition: rd?.gridPosition ?? null,
      qualifyingTimeMs: r.qualifyingTimeMs,
      penalties: activePenalties.filter((p) => p.driverId === r.driverId).map((pe) => ({ seconds: pe.seconds, reason: pe.reason })),
      notes: r.notes,
    };
  });

  const csvRows = tableRows.map((r) => ({
    pos: r.position ?? "",
    name: r.driver.name,
    team: r.teamName ?? "",
    status: r.status,
    kart: r.kartNumber,
    quali: r.qualifyingTimeMs ? formatLapTime(r.qualifyingTimeMs) : "",
    penalty: r.penalties.map((p) => `+${p.seconds}s`).join(" + ") || "",
    notes: r.notes,
  }));

  const sharePreview = (
    <RaceShareCard
      kind="race_winner"
      title={race.name}
      subtitle={`${race.venueName} · ${race.date}`}
      lines={[
        { label: "Winner", value: winnerDriver?.name ?? "—", emphasize: true },
        ...podiumEntries.map((e) => ({ label: `P${e.position}`, value: e.driver.name })),
        { label: "Pole", value: poleDriver?.name ?? "—" },
      ]}
      footer="Local demo preview"
    />
  );

  return (
    <div className="space-y-6">
      <DemoNotice text="Finishing positions are recorded as they were called. Penalties are shown separately and never adjust the order." />

      <ResultsHeader
        raceName={race.name}
        raceStatus={race.status}
        format={race.format}
        groupName={group?.name ?? null}
        venueName={race.venueName}
        date={race.date}
        startTime={race.startTime}
        driverCount={state.drivers.length}
        organizerName={organizer?.name ?? null}
      />

      {winnerDriver && winnerRd && (
        <WinnerCard
          driver={winnerDriver}
          teamName={teamByDriver(winnerDriver.id)}
          finishPosition={1}
          kartNumber={winnerRd.kartNumber}
          qualifyingPosition={winnerRd.gridPosition}
          qualifyingTimeMs={winnerRd.qualifyingTimeMs}
          notes={winnerRow?.notes || undefined}
        />
      )}

      <PodiumCard entries={podiumEntries} />

      <ResultsTable rows={tableRows} title="Official results" />

      {summary && (
        <RaceSummaryCard
          raceName={summary.raceName}
          venueName={race.venueName}
          date={race.date}
          startTime={race.startTime}
          status={race.status}
          winnerName={winnerDriver?.name ?? null}
          poleName={poleDriver?.name ?? null}
        />
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {sharePreview}
          <div className="flex flex-wrap gap-2">
            <CopyShareTextButton text={shareText(race.name, winnerDriver?.name ?? null, podiumEntries)} label="Copy race summary" />
            <ExportCsvButton filename={`${race.name.replace(/\s+/g, "-").toLowerCase()}-results.csv`} columns={csvCols} rows={csvRows} />
          </div>
        </div>
        <Card className="p-5">
          <h2 className="text-sm font-bold">Race data</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
            {summary ? `${summary.driversEntered} drivers entered · ${summary.finishers} finished · ${summary.dnfs} DNF · ${summary.dns} DNS · ${summary.penaltiesIssued} penalties` : "No summary available."}
          </p>
          <p className="mt-3 text-[10px] text-[var(--muted)]">Demo data — changes live in this browser session and reset when you reload.</p>
        </Card>
      </div>
    </div>
  );
}